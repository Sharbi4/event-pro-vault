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
  cancelled_by?: "customer" | "vendor"; // Who initiated the cancellation
}

// Deposit refund rules:
// - Non-refundable by default
// - Exception 1: Vendor cancels → full deposit refund
// - Exception 2: Customer cancels within 1 hour of booking AND event is 7+ days away → deposit refund
function isDepositRefundable(
  cancelledBy: "customer" | "vendor",
  bookingCreatedAt: string,
  eventDate: string
): { refundable: boolean; reason: string } {
  // If vendor cancels, always refund deposit
  if (cancelledBy === "vendor") {
    return { refundable: true, reason: "Vendor cancelled - full deposit refund" };
  }

  // Check grace period: within 1 hour of booking AND event 7+ days away
  const now = new Date();
  const bookingTime = new Date(bookingCreatedAt);
  const event = new Date(eventDate);
  
  const hoursSinceBooking = (now.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
  const daysUntilEvent = (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (hoursSinceBooking <= 1 && daysUntilEvent >= 7) {
    return { refundable: true, reason: "Grace period - cancelled within 1 hour, event 7+ days away" };
  }

  return { refundable: false, reason: "Deposit is non-refundable per policy" };
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
    const { booking_id, booking_type, refund_type, refund_amount, reason, cancelled_by } = body;

    if (!booking_id || !booking_type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let paymentIntentId: string | null = null;
    let depositPaymentIntentId: string | null = null;
    let totalPaidCents: number = 0;
    let depositPaidCents: number = 0;
    let eventDate: string | null = null;
    let bookingCreatedAt: string | null = null;
    let isOwner = false;
    let isVendor = false;
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
      isVendor = booking.vendor_user_id === user.id;
      isOwner = isVendor || booking.user_id === user.id;
      
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
                        booking.stripe_final_payment_intent_id;
      depositPaymentIntentId = booking.stripe_deposit_payment_intent_id;
      
      // Calculate total paid and deposit separately
      depositPaidCents = booking.deposit_paid_at ? (booking.deposit_amount || 0) : 0;
      const finalPaid = booking.final_paid_at ? (booking.final_amount || 0) : 0;
      totalPaidCents = depositPaidCents + finalPaid;
      
      // If no cents calculated, use total_price
      if (totalPaidCents === 0) {
        totalPaidCents = Math.round(Number(booking.total_price) * 100);
      }
      
      eventDate = booking.event_date;
      bookingCreatedAt = booking.created_at;
      
      // Get cancellation policy for policy-based refunds
      cancellationPolicyType = booking.vendor_packages?.cancellation_policy || 'standard';
    }

    if (!paymentIntentId && !depositPaymentIntentId) {
      return new Response(JSON.stringify({ error: "No payment intent found for refund" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine who cancelled (default based on user role if not specified)
    const cancelledByRole = cancelled_by || (isVendor ? "vendor" : "customer");

    // Calculate refund amount based on type
    let refundAmountCents = 0;
    let depositRefundCents = 0;
    let refundPercentage = 0;
    let depositRefundInfo = { refundable: false, reason: "No deposit" };

    // Check deposit refund eligibility
    if (depositPaidCents > 0 && bookingCreatedAt && eventDate) {
      depositRefundInfo = isDepositRefundable(cancelledByRole, bookingCreatedAt, eventDate);
      if (depositRefundInfo.refundable) {
        depositRefundCents = depositPaidCents;
      }
      console.log(`Deposit refund check: ${depositRefundInfo.reason}`);
    }

    if (refund_type === "policy" && eventDate && cancellationPolicyType) {
      // Policy-based refund (applies to non-deposit portion)
      const nonDepositPaid = totalPaidCents - depositPaidCents;
      const policyPercentage = getRefundPercentageFromPolicy(cancellationPolicyType, eventDate);
      const policyRefundCents = Math.round(nonDepositPaid * (policyPercentage / 100));
      
      // Add deposit refund if eligible
      refundAmountCents = policyRefundCents + depositRefundCents;
      refundPercentage = totalPaidCents > 0 ? Math.round((refundAmountCents / totalPaidCents) * 100) : 0;
    } else if (refund_type === "full") {
      // Full refund includes deposit (vendor override or special case)
      refundAmountCents = refund_amount ?? totalPaidCents;
      refundPercentage = 100;
    } else if (refund_type === "partial") {
      refundAmountCents = refund_amount ?? Math.round(totalPaidCents * 0.5);
      refundPercentage = Math.round((refundAmountCents / totalPaidCents) * 100);
    } else if (refund_type === "none") {
      // Even with "none", deposit may be refundable due to grace period or vendor cancel
      refundAmountCents = depositRefundCents;
      refundPercentage = totalPaidCents > 0 ? Math.round((refundAmountCents / totalPaidCents) * 100) : 0;
    }

    // Process refund with Stripe if amount > 0
    let refundResult = null;
    let depositRefundResult = null;
    
    if (refundAmountCents > 0) {
      try {
        // If there's a separate deposit payment intent and we need to refund deposit
        if (depositRefundCents > 0 && depositPaymentIntentId && depositPaymentIntentId !== paymentIntentId) {
          // Refund deposit separately
          depositRefundResult = await stripe.refunds.create({
            payment_intent: depositPaymentIntentId,
            amount: depositRefundCents,
            reason: "requested_by_customer",
            metadata: {
              booking_id,
              booking_type,
              refund_reason: depositRefundInfo.reason,
              refund_type: "deposit",
            },
          });
          console.log(`Deposit refund created: ${depositRefundResult.id} for ${depositRefundCents / 100}`);

          // Refund remaining from main payment
          const remainingRefund = refundAmountCents - depositRefundCents;
          if (remainingRefund > 0 && paymentIntentId) {
            refundResult = await stripe.refunds.create({
              payment_intent: paymentIntentId,
              amount: remainingRefund,
              reason: "requested_by_customer",
              metadata: {
                booking_id,
                booking_type,
                refund_reason: reason || "Booking cancelled",
              },
            });
            console.log(`Main refund created: ${refundResult.id} for ${remainingRefund / 100}`);
          }
        } else {
          // Single payment intent - refund everything from it
          const intentToRefund = paymentIntentId || depositPaymentIntentId;
          if (intentToRefund) {
            refundResult = await stripe.refunds.create({
              payment_intent: intentToRefund,
              amount: refundAmountCents,
              reason: "requested_by_customer",
              metadata: {
                booking_id,
                booking_type,
                refund_reason: reason || "Booking cancelled",
                deposit_refund_reason: depositRefundInfo.reason,
              },
            });
            console.log(`Refund created: ${refundResult.id} for ${refundAmountCents / 100}`);
          }
        }
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
      refund_id: refundResult?.id || depositRefundResult?.id || null,
      refund_amount: refundAmountCents / 100,
      refund_percentage: refundPercentage,
      deposit_refunded: depositRefundCents > 0,
      deposit_refund_reason: depositRefundInfo.reason,
      message: refundAmountCents > 0 
        ? `Refund of $${(refundAmountCents / 100).toFixed(2)} processed successfully${depositRefundCents > 0 ? ` (includes $${(depositRefundCents / 100).toFixed(2)} deposit)` : ''}`
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
