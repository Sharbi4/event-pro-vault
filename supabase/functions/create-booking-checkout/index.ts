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

// Platform fee percentage (e.g., 10%)
const PLATFORM_FEE_PERCENT = 10;
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
      .select('stripe_account_id, stripe_account_status, full_name')
      .eq('user_id', booking.vendor_user_id)
      .single();

    if (vendorError || !vendorProfile?.stripe_account_id) {
      throw new Error("Vendor has not set up payment processing yet");
    }

    if (vendorProfile.stripe_account_status !== 'active') {
      throw new Error("Vendor's payment account is not fully activated");
    }

    logStep("Found vendor Stripe account", { 
      accountId: vendorProfile.stripe_account_id,
      status: vendorProfile.stripe_account_status 
    });

    // Get customer email from the booking's user
    const { data: authUser } = await supabaseClient.auth.admin.getUserById(booking.user_id);
    const customerEmail = authUser?.user?.email;

    if (!customerEmail) {
      throw new Error("Customer email not found");
    }
    logStep("Found customer email", { email: customerEmail });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate amounts (in cents)
    const totalAmountCents = Math.round(booking.total_price * 100);
    const depositAmountCents = Math.round(totalAmountCents * (deposit_percentage / 100));
    const finalAmountCents = totalAmountCents - depositAmountCents;
    const platformFeeCents = Math.round(depositAmountCents * (PLATFORM_FEE_PERCENT / 100));

    logStep("Calculated amounts", {
      total: totalAmountCents,
      deposit: depositAmountCents,
      final: finalAmountCents,
      platformFee: platformFeeCents
    });

    // Check if customer already exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

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
              })}. Remaining ${100 - deposit_percentage}% ($${(finalAmountCents / 100).toFixed(2)}) due on event day.`,
            },
            unit_amount: depositAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: vendorProfile.stripe_account_id,
        },
        metadata: {
          booking_id: booking_id,
          payment_type: 'deposit',
          vendor_user_id: booking.vendor_user_id || '',
        },
      },
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&booking=${booking_id}&type=deposit`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled&booking=${booking_id}`,
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
        deposit_amount: depositAmountCents,
        deposit_percentage: deposit_percentage,
        final_amount: finalAmountCents,
        vendor_stripe_account_id: vendorProfile.stripe_account_id,
        platform_fee_amount: platformFeeCents,
      })
      .eq('id', booking_id);

    if (updateError) {
      logStep("Warning: Failed to update booking", { error: updateError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url, 
      session_id: session.id,
      deposit_amount: depositAmountCents / 100,
      final_amount: finalAmountCents / 100,
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
