import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Cancellation policy definitions - synced with frontend
const CANCELLATION_POLICIES = {
  flexible: {
    tiers: [
      { daysBeforeEvent: 2, refundPercentage: 100 },  // 48+ hours
      { daysBeforeEvent: 1, refundPercentage: 50 },   // 24-48 hours
      { daysBeforeEvent: 0, refundPercentage: 0 },    // <24 hours
    ],
  },
  standard: {
    tiers: [
      { daysBeforeEvent: 7, refundPercentage: 100 },  // 7+ days
      { daysBeforeEvent: 3, refundPercentage: 50 },   // 3-7 days
      { daysBeforeEvent: 0, refundPercentage: 0 },    // <72 hours
    ],
  },
  strict: {
    tiers: [
      { daysBeforeEvent: 14, refundPercentage: 100 }, // 14+ days
      { daysBeforeEvent: 7, refundPercentage: 50 },   // 7-14 days
      { daysBeforeEvent: 0, refundPercentage: 0 },    // <7 days
    ],
  },
};

function getRefundPercentageFromPolicy(policyType: string, eventDate: string): number {
  const policy = CANCELLATION_POLICIES[policyType as keyof typeof CANCELLATION_POLICIES] 
    || CANCELLATION_POLICIES.standard;
  
  const now = new Date();
  const event = new Date(eventDate);
  const hoursUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntilEvent = hoursUntilEvent / 24;

  for (const tier of policy.tiers) {
    if (daysUntilEvent >= tier.daysBeforeEvent) {
      return tier.refundPercentage;
    }
  }

  return 0;
}

interface RefundRequest {
  booking_id: string;
  booking_type: "slot_booking" | "booking";
  refund_type: "policy" | "full" | "partial" | "none";
  refund_amount?: number; // Optional override amount in cents
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RefundRequest = await req.json();
    const { booking_id, booking_type, refund_type, refund_amount, reason } = body;

    if (!booking_id || !booking_type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let paymentIntentId: string | null = null;
    let totalPaidCents: number = 0;
    let eventDate: string | null = null;
    let isOwner = false;
    let cancellationPolicyType: string | null = null;

    // Fetch booking based on type
    if (booking_type === "slot_booking") {
      const { data: booking, error } = await supabaseAdmin
        .from("slot_bookings")
        .select("*, slot_inventory(date)")
        .eq("id", booking_id)
        .single();

      if (error || !booking) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user is market owner or the booker
      isOwner = booking.vendor_user_id === user.id || booking.user_id === user.id;
      
      if (!isOwner) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (booking.payment_status !== "paid") {
        return new Response(JSON.stringify({ error: "No payment to refund" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      paymentIntentId = booking.stripe_payment_intent_id;
      totalPaidCents = Math.round(Number(booking.total_price) * 100);
      eventDate = booking.slot_inventory?.date;

    } else {
      // Regular booking (vendor packages)
      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .select("*, vendor_packages:package_id(cancellation_policy)")
        .eq("id", booking_id)
        .single();

      if (error || !booking) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user is vendor or the booker
      isOwner = booking.vendor_user_id === user.id || booking.user_id === user.id;
      
      if (!isOwner) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (booking.payment_status !== "paid") {
        return new Response(JSON.stringify({ error: "No payment to refund" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get the payment intent - could be deposit or full payment
      paymentIntentId = booking.stripe_payment_intent_id || 
                        booking.stripe_deposit_payment_intent_id;
      
      // Calculate total paid
      const depositPaid = booking.deposit_paid_at ? (booking.deposit_amount || 0) : 0;
      const finalPaid = booking.final_paid_at ? (booking.final_amount || 0) : 0;
      totalPaidCents = depositPaid + finalPaid;
      
      // If no cents calculated, use total_price
      if (totalPaidCents === 0) {
        totalPaidCents = Math.round(Number(booking.total_price) * 100);
      }
      
      eventDate = booking.event_date;
      
      // Get cancellation policy for policy-based refunds
      cancellationPolicyType = booking.vendor_packages?.cancellation_policy || 'standard';
    }

    if (!paymentIntentId) {
      return new Response(JSON.stringify({ error: "No payment intent found for refund" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate refund amount based on type
    let refundAmountCents = 0;
    let refundPercentage = 0;

    if (refund_type === "policy" && eventDate && cancellationPolicyType) {
      // Policy-based refund
      const policyPercentage = getRefundPercentageFromPolicy(cancellationPolicyType, eventDate);
      refundAmountCents = Math.round(totalPaidCents * (policyPercentage / 100));
      refundPercentage = policyPercentage;
    } else if (refund_type === "full") {
      refundAmountCents = refund_amount ?? totalPaidCents;
      refundPercentage = 100;
    } else if (refund_type === "partial") {
      refundAmountCents = refund_amount ?? Math.round(totalPaidCents * 0.5);
      refundPercentage = Math.round((refundAmountCents / totalPaidCents) * 100);
    } else if (refund_type === "none") {
      refundAmountCents = 0;
      refundPercentage = 0;
    }

    // Process refund with Stripe if amount > 0
    let refundResult = null;
    if (refundAmountCents > 0) {
      try {
        refundResult = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: refundAmountCents,
          reason: "requested_by_customer",
          metadata: {
            booking_id,
            booking_type,
            refund_reason: reason || "Booking cancelled",
          },
        });

        console.log(`Refund created: ${refundResult.id} for ${refundAmountCents / 100}`);
      } catch (stripeError: any) {
        console.error("Stripe refund error:", stripeError);
        
        // Check if already refunded
        if (stripeError.code === "charge_already_refunded") {
          return new Response(JSON.stringify({ 
            error: "This payment has already been refunded" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ 
          error: stripeError.message || "Failed to process refund" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update booking status
    const updateData = {
      status: "cancelled",
      payment_status: refundAmountCents > 0 ? "refunded" : "cancelled",
      updated_at: new Date().toISOString(),
    };

    if (booking_type === "slot_booking") {
      const { error: updateError } = await supabaseAdmin
        .from("slot_bookings")
        .update(updateData)
        .eq("id", booking_id);

      if (updateError) {
        console.error("Error updating slot booking:", updateError);
      }

      // Restore inventory
      const { data: booking } = await supabaseAdmin
        .from("slot_bookings")
        .select("slot_inventory_id, quantity")
        .eq("id", booking_id)
        .single();

      if (booking?.slot_inventory_id) {
        const { data: inventory } = await supabaseAdmin
          .from("slot_inventory")
          .select("slots_remaining")
          .eq("id", booking.slot_inventory_id)
          .single();

        if (inventory) {
          await supabaseAdmin
            .from("slot_inventory")
            .update({
              slots_remaining: inventory.slots_remaining + booking.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", booking.slot_inventory_id);
        }
      }
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("bookings")
        .update(updateData)
        .eq("id", booking_id);

      if (updateError) {
        console.error("Error updating booking:", updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      refund_id: refundResult?.id || null,
      refund_amount: refundAmountCents / 100,
      refund_percentage: refundPercentage,
      message: refundAmountCents > 0 
        ? `Refund of $${(refundAmountCents / 100).toFixed(2)} processed successfully`
        : "Booking cancelled without refund",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Process refund error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
