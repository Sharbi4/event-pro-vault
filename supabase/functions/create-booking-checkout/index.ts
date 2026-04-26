import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-BOOKING-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
};

// Fee structure: vendor commission (tier-based) + 12.9% booker service fee
// Free tier vendors: 12.9% commission. Premium tier vendors: 6% commission.
const VENDOR_COMMISSION_PERCENT_FREE = 12.9;
const VENDOR_COMMISSION_PERCENT_PREMIUM = 6;
const BOOKER_SERVICE_FEE_PERCENT = 12.9;
// Default deposit percentage
const DEFAULT_DEPOSIT_PERCENT = 50;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { booking_id, deposit_percentage = DEFAULT_DEPOSIT_PERCENT } = await req.json();
    if (!booking_id) {
      throw new Error("booking_id is required");
    }
    logStep("Received request", { booking_id, deposit_percentage });

    // Fetch the booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message || 'Unknown error'}`);
    }
    logStep("Fetched booking", { booking_id: booking.id, total_price: booking.total_price });

    // Get vendor's Stripe Connect account
    const { data: vendorProfile, error: vendorError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_account_status, full_name, subscription_tier, subscription_ends_at')
      .eq('user_id', booking.vendor_user_id)
      .single();

    if (vendorError || !vendorProfile?.stripe_account_id) {
      logStep("Vendor missing Stripe account", { vendor_user_id: booking.vendor_user_id });
      return new Response(JSON.stringify({
        error: "vendor_payments_not_setup",
        message: "This Event Pro hasn't enabled online payments yet. You can still book using cash / pay-in-person, or message them to set up online payments.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (vendorProfile.stripe_account_status !== 'active') {
      logStep("Vendor Stripe account not active", { status: vendorProfile.stripe_account_status });
      return new Response(JSON.stringify({
        error: "vendor_payments_pending",
        message: "This Event Pro is still finishing their payment account setup. Please try cash / pay-in-person, or contact them directly.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found vendor Stripe account", {
      accountId: vendorProfile.stripe_account_id,
      status: vendorProfile.stripe_account_status
    });

    // Get customer email — prefer booking row (works for guests), fall back to auth user
    let customerEmail = (booking as any).customer_email as string | null;
    if (!customerEmail && booking.user_id) {
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(booking.user_id);
      customerEmail = authUser?.user?.email ?? null;
    }

    if (!customerEmail) {
      return new Response(JSON.stringify({
        error: "customer_email_missing",
        message: "We couldn't find an email for this booking. Please contact support.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Found customer email", { email: customerEmail });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate amounts (in cents)
    // Base price from vendor
    const baseTotalCents = Math.round(booking.total_price * 100);
    const baseDepositCents = Math.round(baseTotalCents * (deposit_percentage / 100));
    const baseFinalCents = baseTotalCents - baseDepositCents;
    
    // Booker service fee (12.9% added to what customer pays)
    const bookerServiceFeeCents = Math.round(baseDepositCents * (BOOKER_SERVICE_FEE_PERCENT / 100));
    const customerPaysCents = baseDepositCents + bookerServiceFeeCents;

    // Vendor commission — 6% if premium subscription is active, otherwise 12.9%
    const isPremium = vendorProfile.subscription_tier === 'premium'
      && (!vendorProfile.subscription_ends_at || new Date(vendorProfile.subscription_ends_at) > new Date());
    const vendorCommissionPercent = isPremium ? VENDOR_COMMISSION_PERCENT_PREMIUM : VENDOR_COMMISSION_PERCENT_FREE;
    const vendorCommissionCents = Math.round(baseDepositCents * (vendorCommissionPercent / 100));
    logStep("Vendor commission tier", { tier: vendorProfile.subscription_tier, isPremium, vendorCommissionPercent });

    // Total platform revenue = booker fee + vendor commission
    const totalPlatformFeeCents = bookerServiceFeeCents + vendorCommissionCents;

    logStep("Calculated amounts", {
      baseTotal: baseTotalCents,
      baseDeposit: baseDepositCents,
      baseFinal: baseFinalCents,
      bookerServiceFee: bookerServiceFeeCents,
      customerPays: customerPaysCents,
      vendorCommission: vendorCommissionCents,
      totalPlatformFee: totalPlatformFeeCents
    });

    // Check if customer already exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Calculate final amount customer will owe (base final + service fee)
    const finalCustomerPaysCents = baseFinalCents + Math.round(baseFinalCents * (BOOKER_SERVICE_FEE_PERCENT / 100));

    // Create checkout session for deposit with Connect
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit - ${booking.event_location}`,
              description: `${deposit_percentage}% deposit for event on ${new Date(booking.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}. Includes ${BOOKER_SERVICE_FEE_PERCENT}% service fee. Remaining $${(finalCustomerPaysCents / 100).toFixed(2)} due on event day.`,
            },
            unit_amount: customerPaysCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: totalPlatformFeeCents,
        transfer_data: {
          destination: vendorProfile.stripe_account_id,
        },
        metadata: {
          booking_id: booking_id,
          payment_type: 'deposit',
          vendor_user_id: booking.vendor_user_id || '',
        },
      },
      success_url: `${req.headers.get("origin")}/booking-success?booking=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/discover?payment=cancelled&booking=${booking_id}`,
      metadata: {
        booking_id: booking_id,
        payment_type: 'deposit',
        vendor_user_id: booking.vendor_user_id || '',
      },
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    // Update booking with checkout session and payment details
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        stripe_checkout_session_id: session.id,
        customer_email: customerEmail,
        payment_status: 'pending',
        deposit_amount: customerPaysCents, // What customer pays (includes service fee)
        deposit_percentage: deposit_percentage,
        final_amount: finalCustomerPaysCents, // What customer will pay for final (includes service fee)
        vendor_stripe_account_id: vendorProfile.stripe_account_id,
        platform_fee_amount: totalPlatformFeeCents, // Combined platform revenue
      })
      .eq('id', booking_id);

    if (updateError) {
      logStep("Warning: Failed to update booking", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url, 
      session_id: session.id,
      deposit_amount: customerPaysCents / 100,
      final_amount: finalCustomerPaysCents / 100,
      service_fee: bookerServiceFeeCents / 100,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
