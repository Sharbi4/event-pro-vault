import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        console.log(`Transfer created: ${transfer.id} for ${transfer.amount / 100}`);
        break;
      }
      
      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        console.log(`Payout completed: ${payout.id} for ${payout.amount / 100}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
  
  const metadata = paymentIntent.metadata;
  
  // Handle slot bookings
  if (metadata?.slot_booking_id) {
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.slot_booking_id);
    
    if (error) {
      console.error("Error updating slot booking:", error);
    } else {
      console.log(`Slot booking ${metadata.slot_booking_id} marked as paid`);
      
      // Decrement inventory
      if (metadata.slot_inventory_id && metadata.quantity) {
        await decrementSlotInventory(metadata.slot_inventory_id, parseInt(metadata.quantity));
      }
    }
  }
  
  // Handle regular bookings (vendor packages)
  if (metadata?.booking_id) {
    const updateData: Record<string, unknown> = {
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    };
    
    if (metadata.payment_type === "deposit") {
      updateData.deposit_paid_at = new Date().toISOString();
      updateData.stripe_deposit_payment_intent_id = paymentIntent.id;
      updateData.status = "confirmed";
    } else if (metadata.payment_type === "final") {
      updateData.final_paid_at = new Date().toISOString();
      updateData.stripe_final_payment_intent_id = paymentIntent.id;
      updateData.status = "completed";
    } else {
      updateData.stripe_payment_intent_id = paymentIntent.id;
      updateData.status = "confirmed";
    }
    
    const { error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
      .eq("id", metadata.booking_id);
    
    if (error) {
      console.error("Error updating booking:", error);
    } else {
      console.log(`Booking ${metadata.booking_id} payment recorded`);
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent failed: ${paymentIntent.id}`);
  
  const metadata = paymentIntent.metadata;
  
  if (metadata?.slot_booking_id) {
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.slot_booking_id);
    
    if (error) {
      console.error("Error updating slot booking:", error);
    }
  }
  
  if (metadata?.booking_id) {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.booking_id);
    
    if (error) {
      console.error("Error updating booking:", error);
    }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Checkout session completed: ${session.id}`);
  
  const metadata = session.metadata;
  
  // Handle slot bookings from checkout
  if (metadata?.slot_booking_id) {
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.slot_booking_id);
    
    if (error) {
      console.error("Error updating slot booking from checkout:", error);
    } else {
      console.log(`Slot booking ${metadata.slot_booking_id} confirmed from checkout`);
      
      // Decrement inventory
      if (metadata.slot_inventory_id && metadata.quantity) {
        await decrementSlotInventory(metadata.slot_inventory_id, parseInt(metadata.quantity));
      }
    }
  }
  
  // Handle regular bookings from checkout
  if (metadata?.booking_id) {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.booking_id);
    
    if (error) {
      console.error("Error updating booking from checkout:", error);
    } else {
      console.log(`Booking ${metadata.booking_id} confirmed from checkout`);
    }
  }
}

async function decrementSlotInventory(inventoryId: string, quantity: number) {
  // First get current inventory
  const { data: inventory, error: fetchError } = await supabaseAdmin
    .from("slot_inventory")
    .select("slots_remaining")
    .eq("id", inventoryId)
    .single();
  
  if (fetchError || !inventory) {
    console.error("Error fetching inventory:", fetchError);
    return;
  }
  
  const newRemaining = Math.max(0, inventory.slots_remaining - quantity);
  
  const { error: updateError } = await supabaseAdmin
    .from("slot_inventory")
    .update({
      slots_remaining: newRemaining,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventoryId);
  
  if (updateError) {
    console.error("Error decrementing inventory:", updateError);
  } else {
    console.log(`Inventory ${inventoryId} decremented by ${quantity}, now ${newRemaining} remaining`);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}, amount refunded: ${charge.amount_refunded / 100}`);
  
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.log("No payment intent on refunded charge");
    return;
  }

  // Check for slot booking with this payment intent
  const { data: slotBooking } = await supabaseAdmin
    .from("slot_bookings")
    .select("id, quantity, slot_inventory_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (slotBooking) {
    // Update slot booking status
    const { error } = await supabaseAdmin
      .from("slot_bookings")
      .update({
        payment_status: "refunded",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", slotBooking.id);

    if (error) {
      console.error("Error updating slot booking for refund:", error);
    } else {
      console.log(`Slot booking ${slotBooking.id} marked as refunded`);
      
      // Restore inventory
      if (slotBooking.slot_inventory_id) {
        const { data: inventory } = await supabaseAdmin
          .from("slot_inventory")
          .select("slots_remaining")
          .eq("id", slotBooking.slot_inventory_id)
          .single();

        if (inventory) {
          await supabaseAdmin
            .from("slot_inventory")
            .update({
              slots_remaining: inventory.slots_remaining + slotBooking.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", slotBooking.slot_inventory_id);
          
          console.log(`Restored ${slotBooking.quantity} slots to inventory`);
        }
      }
    }
    return;
  }

  // Check for regular booking with this payment intent
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .or(`stripe_payment_intent_id.eq.${paymentIntentId},stripe_deposit_payment_intent_id.eq.${paymentIntentId},stripe_final_payment_intent_id.eq.${paymentIntentId}`)
    .single();

  if (booking) {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "refunded",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (error) {
      console.error("Error updating booking for refund:", error);
    } else {
      console.log(`Booking ${booking.id} marked as refunded`);
    }
  }
}
