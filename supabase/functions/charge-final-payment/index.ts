import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CHARGE-FINAL-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

// Fee structure: vendor commission (tier-based) + 12.9% booker service fee
// Free tier vendors: 12.9% commission. Premium tier vendors: 6% commission.
const VENDOR_COMMISSION_PERCENT_FREE = 12.9;
const VENDOR_COMMISSION_PERCENT_PREMIUM = 6;
const BOOKER_SERVICE_FEE_PERCENT = 12.9;

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

    const { booking_id } = await req.json();
    if (!booking_id) {
      throw new Error("booking_id is required");
    }
    logStep("Received booking_id", { booking_id });

    // Fetch the booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message || 'Unknown error'}`);
    }

    // Check if deposit was paid
    if (!booking.deposit_paid_at) {
      throw new Error("Deposit has not been paid yet");
    }

    // Check if final payment already made
    if (booking.final_paid_at) {
      throw new Error("Final payment has already been processed");
    }

    // Check if there's a remaining amount
    if (!booking.final_amount || booking.final_amount <= 0) {
      throw new Error("No remaining balance to charge");
    }

    logStep("Booking validated", { 
      booking_id: booking.id, 
      final_amount: booking.final_amount,
      vendor_account: booking.vendor_stripe_account_id
    });

    // Get customer's saved payment method from the deposit payment
    const { data: authUser } = await supabaseClient.auth.admin.getUserById(booking.user_id);
    const customerEmail = authUser?.user?.email;

    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Look up the vendor's subscription tier to determine commission rate
    const { data: vendorProfile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, subscription_ends_at')
      .eq('user_id', booking.vendor_user_id)
      .single();
    const isPremium = vendorProfile?.subscription_tier === 'premium'
      && (!vendorProfile.subscription_ends_at || new Date(vendorProfile.subscription_ends_at) > new Date());
    const vendorCommissionPercent = isPremium ? VENDOR_COMMISSION_PERCENT_PREMIUM : VENDOR_COMMISSION_PERCENT_FREE;
    logStep("Vendor commission tier", { tier: vendorProfile?.subscription_tier, isPremium, vendorCommissionPercent });

    // The final_amount already includes the booker service fee from create-booking-checkout
    // We need to calculate vendor commission based on the base amount
    // Base amount = final_amount / (1 + BOOKER_SERVICE_FEE_PERCENT / 100)
    const baseFinalCents = Math.round(booking.final_amount / (1 + BOOKER_SERVICE_FEE_PERCENT / 100));
    const bookerServiceFeeCents = booking.final_amount - baseFinalCents;
    const vendorCommissionCents = Math.round(baseFinalCents * (vendorCommissionPercent / 100));
    const totalPlatformFeeCents = bookerServiceFeeCents + vendorCommissionCents;

    logStep("Calculated final payment fees", {
      finalAmount: booking.final_amount,
      baseFinal: baseFinalCents,
      bookerServiceFee: bookerServiceFeeCents,
      vendorCommission: vendorCommissionCents,
      totalPlatformFee: totalPlatformFeeCents
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for final payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Final Payment - ${booking.event_location}`,
              description: `Remaining balance for event on ${new Date(booking.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}. Includes ${BOOKER_SERVICE_FEE_PERCENT}% service fee.`,
            },
            unit_amount: booking.final_amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: totalPlatformFeeCents,
        transfer_data: {
          destination: booking.vendor_stripe_account_id,
        },
        metadata: {
          booking_id: booking_id,
          payment_type: 'final',
        },
      },
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&booking=${booking_id}&type=final`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled&booking=${booking_id}`,
      metadata: {
        booking_id: booking_id,
        payment_type: 'final',
      },
    });

    logStep("Created final payment checkout session", { sessionId: session.id });

    return new Response(JSON.stringify({ 
      url: session.url, 
      session_id: session.id,
      amount: booking.final_amount / 100,
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
