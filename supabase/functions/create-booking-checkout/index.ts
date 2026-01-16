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
    logStep("Fetched booking", { booking_id: booking.id, total_price: booking.total_price });

    // Get customer email from the booking's user
    const { data: customerProfile } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', booking.user_id)
      .single();

    // Get user email from auth
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

    // Check if customer already exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking Payment - ${booking.event_location}`,
              description: `Event on ${new Date(booking.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
            },
            unit_amount: Math.round(booking.total_price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&booking=${booking_id}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled&booking=${booking_id}`,
      metadata: {
        booking_id: booking_id,
        vendor_user_id: booking.vendor_user_id || '',
      },
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    // Update booking with checkout session ID and customer email
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        stripe_checkout_session_id: session.id,
        customer_email: customerEmail,
        payment_status: 'pending'
      })
      .eq('id', booking_id);

    if (updateError) {
      logStep("Warning: Failed to update booking", { error: updateError.message });
    }

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
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
