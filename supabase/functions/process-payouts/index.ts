import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_RATE = 0.129; // 12.9% commission from market host
const PAYOUT_DELAY_HOURS = 24;

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
    console.log("Starting payout processing...");
    
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (PAYOUT_DELAY_HOURS * 60 * 60 * 1000));
    const cutoffDate = cutoffTime.toISOString().split("T")[0];
    
    console.log(`Processing payouts for events before: ${cutoffDate}`);
    
    // Process slot bookings (market bookings)
    const slotPayoutsResult = await processSlotBookingPayouts(cutoffDate);
    
    // Process regular bookings (vendor packages)
    const vendorPayoutsResult = await processVendorBookingPayouts(cutoffDate);
    
    const result = {
      processed_at: now.toISOString(),
      cutoff_date: cutoffDate,
      slot_bookings: slotPayoutsResult,
      vendor_bookings: vendorPayoutsResult,
    };
    
    console.log("Payout processing complete:", result);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Payout processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processSlotBookingPayouts(cutoffDate: string) {
  // Find confirmed slot bookings with past event dates that haven't been paid out
  const { data: bookings, error: fetchError } = await supabaseAdmin
    .from("slot_bookings")
    .select(`
      id,
      total_price,
      market_id,
      payment_status,
      status,
      slot_inventory!inner(date),
      markets!inner(stripe_account_id, stripe_account_status)
    `)
    .eq("status", "confirmed")
    .eq("payment_status", "paid")
    .lte("slot_inventory.date", cutoffDate);
  
  if (fetchError) {
    console.error("Error fetching slot bookings:", fetchError);
    return { error: fetchError.message, processed: 0, transferred: 0 };
  }
  
  if (!bookings || bookings.length === 0) {
    console.log("No slot bookings ready for payout");
    return { processed: 0, transferred: 0 };
  }
  
  console.log(`Found ${bookings.length} slot bookings ready for payout`);
  
  let processed = 0;
  let transferred = 0;
  let totalAmount = 0;
  
  for (const booking of bookings) {
    try {
      const marketData = booking.markets as unknown as { stripe_account_id: string | null; stripe_account_status: string | null } | null;
      
      if (!marketData?.stripe_account_id || marketData.stripe_account_status !== "active") {
        console.log(`Skipping booking ${booking.id}: Market Stripe not connected`);
        continue;
      }
      
      // Calculate payout amount (slot price - platform fee)
      const slotPrice = Number(booking.total_price);
      const platformFee = Math.round(slotPrice * PLATFORM_FEE_RATE * 100); // in cents
      const payoutAmount = Math.round(slotPrice * 100) - platformFee; // in cents
      
      if (payoutAmount <= 0) {
        console.log(`Skipping booking ${booking.id}: Payout amount too low`);
        continue;
      }
      
      // Create transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: payoutAmount,
        currency: "usd",
        destination: marketData.stripe_account_id,
        metadata: {
          slot_booking_id: booking.id,
          market_id: booking.market_id,
          slot_price: slotPrice.toString(),
          platform_fee: (platformFee / 100).toString(),
        },
      });
      
      console.log(`Transfer created: ${transfer.id} for $${payoutAmount / 100} to ${marketData.stripe_account_id}`);
      
      // Update booking status to completed
      const { error: updateError } = await supabaseAdmin
        .from("slot_bookings")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
      
      if (updateError) {
        console.error(`Error updating booking ${booking.id}:`, updateError);
      }
      
      transferred++;
      totalAmount += payoutAmount / 100;
    } catch (transferError) {
      console.error(`Error processing payout for booking ${booking.id}:`, transferError);
    }
    
    processed++;
  }
  
  return { processed, transferred, total_amount: totalAmount };
}

async function processVendorBookingPayouts(cutoffDate: string) {
  // Find confirmed bookings with past event dates that haven't been fully paid out
  const { data: bookings, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      total_price,
      vendor_user_id,
      vendor_stripe_account_id,
      payment_status,
      status,
      event_date,
      deposit_paid_at,
      final_paid_at,
      platform_fee_amount
    `)
    .in("status", ["confirmed", "deposit_paid"])
    .lte("event_date", cutoffDate)
    .not("vendor_stripe_account_id", "is", null);
  
  if (fetchError) {
    console.error("Error fetching vendor bookings:", fetchError);
    return { error: fetchError.message, processed: 0, transferred: 0 };
  }
  
  if (!bookings || bookings.length === 0) {
    console.log("No vendor bookings ready for payout");
    return { processed: 0, transferred: 0 };
  }
  
  console.log(`Found ${bookings.length} vendor bookings ready for payout`);
  
  let processed = 0;
  let transferred = 0;
  let totalAmount = 0;
  
  for (const booking of bookings) {
    try {
      if (!booking.vendor_stripe_account_id) {
        console.log(`Skipping booking ${booking.id}: Vendor Stripe not connected`);
        continue;
      }
      
      // Calculate payout amount
      const totalPrice = Number(booking.total_price);
      const platformFee = booking.platform_fee_amount || Math.round(totalPrice * PLATFORM_FEE_RATE * 100);
      const payoutAmount = Math.round(totalPrice * 100) - platformFee;
      
      if (payoutAmount <= 0) {
        console.log(`Skipping booking ${booking.id}: Payout amount too low`);
        continue;
      }
      
      // Create transfer to vendor's connected account
      const transfer = await stripe.transfers.create({
        amount: payoutAmount,
        currency: "usd",
        destination: booking.vendor_stripe_account_id,
        metadata: {
          booking_id: booking.id,
          vendor_user_id: booking.vendor_user_id,
          total_price: totalPrice.toString(),
          platform_fee: (platformFee / 100).toString(),
        },
      });
      
      console.log(`Transfer created: ${transfer.id} for $${payoutAmount / 100} to vendor`);
      
      // Update booking status to completed
      const { error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
      
      if (updateError) {
        console.error(`Error updating booking ${booking.id}:`, updateError);
      }
      
      transferred++;
      totalAmount += payoutAmount / 100;
    } catch (transferError) {
      console.error(`Error processing payout for booking ${booking.id}:`, transferError);
    }
    
    processed++;
  }
  
  return { processed, transferred, total_amount: totalAmount };
}
