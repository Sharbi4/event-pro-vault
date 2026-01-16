import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[VERIFY-BOOKING-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
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

    const { booking_id, payment_type = 'deposit' } = await req.json();
    if (!booking_id) {
      throw new Error("booking_id is required");
    }
    logStep("Received request", { booking_id, payment_type });

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message || 'Unknown error'}`);
    }

    if (!booking.stripe_checkout_session_id) {
      return new Response(JSON.stringify({ 
        paid: false, 
        message: "No checkout session found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found booking with session", { 
      booking_id: booking.id, 
      session_id: booking.stripe_checkout_session_id 
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(
      booking.stripe_checkout_session_id
    );

    logStep("Retrieved session", { 
      status: session.status, 
      payment_status: session.payment_status,
      metadata: session.metadata
    });

    if (session.payment_status === 'paid') {
      const updateData: Record<string, unknown> = {};
      
      // Determine if this is deposit or final payment based on session metadata or payment_type
      const isDeposit = session.metadata?.payment_type === 'deposit' || payment_type === 'deposit';
      
      if (isDeposit && !booking.deposit_paid_at) {
        updateData.payment_status = 'deposit_paid';
        updateData.deposit_paid_at = new Date().toISOString();
        updateData.stripe_deposit_payment_intent_id = session.payment_intent as string;
        updateData.status = 'confirmed'; // Confirm booking after deposit
        logStep("Marking deposit as paid");
      } else if (!isDeposit && !booking.final_paid_at) {
        updateData.payment_status = 'paid';
        updateData.final_paid_at = new Date().toISOString();
        updateData.stripe_final_payment_intent_id = session.payment_intent as string;
        logStep("Marking final payment as paid");
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update(updateData)
          .eq('id', booking_id);

        if (updateError) {
          logStep("Warning: Failed to update booking", { error: updateError.message });
        } else {
          logStep("Updated booking", updateData);
        }
      }

      return new Response(JSON.stringify({ 
        paid: true, 
        payment_type: isDeposit ? 'deposit' : 'final',
        status: updateData.status || booking.status,
        deposit_paid: !!booking.deposit_paid_at || isDeposit,
        final_paid: !!booking.final_paid_at || !isDeposit,
        amount: session.amount_total 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      paid: false, 
      session_status: session.status,
      payment_status: session.payment_status 
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
