// Sends a Stripe Connect-hosted payment link for the remaining balance of a deposit booking.
// Reuses the platform fee + transfer_data[destination] model so the vendor's connected account
// receives the balance net of the platform commission.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Free tier vendors: 12.9% commission. Premium tier vendors: 6% commission.
const VENDOR_COMMISSION_PERCENT_FREE = 12.9;
const VENDOR_COMMISSION_PERCENT_PREMIUM = 6;
const BOOKER_SERVICE_FEE_PERCENT = 12.9;

const log = (s: string, d?: unknown) =>
  console.log(`[SEND-BALANCE-LINK] ${s}`, d ? JSON.stringify(d) : "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Auth — only the vendor for this booking may issue a balance link
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Missing Authorization header");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userData } = await userClient.auth.getUser();
    const caller = userData?.user;
    if (!caller) throw new Error("Not authenticated");

    const { booking_id } = await req.json();
    if (!booking_id || typeof booking_id !== "string") {
      throw new Error("booking_id is required");
    }
    log("Request", { booking_id, caller: caller.id });

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();
    if (bErr || !booking) throw new Error(`Booking not found: ${bErr?.message}`);

    if (booking.vendor_user_id !== caller.id) {
      throw new Error("Only the vendor can send a balance link");
    }
    if (!booking.deposit_paid_at) {
      throw new Error("Deposit not paid yet — cannot collect balance");
    }
    if (booking.final_paid_at) {
      throw new Error("Balance already paid");
    }
    const finalAmount = Number(booking.final_amount ?? 0);
    if (!finalAmount || finalAmount <= 0) {
      throw new Error("No remaining balance");
    }

    const { data: vendor } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_account_status, subscription_tier, subscription_ends_at")
      .eq("user_id", booking.vendor_user_id)
      .single();
    if (!vendor?.stripe_account_id || vendor.stripe_account_status !== "active") {
      throw new Error("Vendor's payment account is not active");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // final_amount is the vendor's base balance in cents.
    const baseFinalCents = finalAmount;
    const bookerServiceFeeCents = Math.round(
      baseFinalCents * (BOOKER_SERVICE_FEE_PERCENT / 100)
    );
    const isPremium = vendor.subscription_tier === 'premium'
      && (!vendor.subscription_ends_at || new Date(vendor.subscription_ends_at) > new Date());
    const vendorCommissionPercent = isPremium ? VENDOR_COMMISSION_PERCENT_PREMIUM : VENDOR_COMMISSION_PERCENT_FREE;
    const vendorCommissionCents = Math.round(
      baseFinalCents * (vendorCommissionPercent / 100)
    );
    const customerPaysCents = baseFinalCents + bookerServiceFeeCents;
    const platformFeeCents = bookerServiceFeeCents + vendorCommissionCents;
    log("Vendor commission tier", { tier: vendor.subscription_tier, isPremium, vendorCommissionPercent });

    const origin = req.headers.get("origin") ?? "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.customer_email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: customerPaysCents,
            product_data: {
              name: `Remaining balance — booking ${booking.id.slice(0, 8)}`,
              description: `Final payment for your event on ${booking.event_date}`,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: vendor.stripe_account_id },
        metadata: {
          booking_id: booking.id,
          payment_type: "balance",
        },
      },
      success_url: `${origin}/booking/${booking.id}?balance=success`,
      cancel_url: `${origin}/booking/${booking.id}?balance=cancelled`,
      metadata: {
        booking_id: booking.id,
        payment_type: "balance",
      },
    });

    await supabase
      .from("bookings")
      .update({
        stripe_final_payment_intent_id: session.payment_intent as string | null,
      })
      .eq("id", booking.id);

    log("Created balance session", { id: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log("Error", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
