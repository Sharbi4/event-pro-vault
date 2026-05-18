// One-shot admin utility to create a fully-onboarded test-mode Connect account
// and attach it to a chosen seed vendor profile, so end-to-end booking checkout works.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { vendor_email } = await req.json().catch(() => ({}));
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pick the vendor
    const q = supa.from("profiles").select("user_id,email,display_name,full_name").eq("is_vendor", true).limit(1);
    const { data: vendors, error: vErr } = vendor_email
      ? await supa.from("profiles").select("user_id,email,display_name,full_name").eq("email", vendor_email).limit(1)
      : await q;
    if (vErr) throw vErr;
    if (!vendors || vendors.length === 0) throw new Error("No vendor found");
    const vendor = vendors[0];

    // Create a Custom Connect test account, fully prefilled so test mode marks it active
    const acct = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: vendor.email || "test-vendor@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        mcc: "5812",
        product_description: "Mobile food and event catering services",
        url: "https://event-pro-vault.lovable.app",
        support_email: vendor.email || "test-vendor@example.com",
      },
      individual: {
        first_name: "Test",
        last_name: "Vendor",
        email: vendor.email || "test-vendor@example.com",
        phone: "+15555550123",
        ssn_last_4: "0000",
        id_number: "000000000",
        dob: { day: 1, month: 1, year: 1990 },
        address: {
          line1: "address_full_match",
          city: "South San Francisco",
          state: "CA",
          postal_code: "94080",
          country: "US",
        },
      },
      external_account: {
        object: "bank_account",
        country: "US",
        currency: "usd",
        routing_number: "110000000",
        account_number: "000123456789",
      } as any,
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: "127.0.0.1",
        service_agreement: "full",
      },
      settings: {
        payouts: { schedule: { interval: "manual" } },
      },
    });

    // Re-fetch to get latest capability status
    const refreshed = await stripe.accounts.retrieve(acct.id);
    const chargesEnabled = refreshed.charges_enabled;
    const payoutsEnabled = refreshed.payouts_enabled;

    const { error: upErr } = await supa
      .from("profiles")
      .update({
        stripe_account_id: acct.id,
        stripe_account_status: chargesEnabled ? "active" : "pending",
      })
      .eq("user_id", vendor.user_id);
    if (upErr) throw upErr;

    return new Response(
      JSON.stringify({
        vendor_user_id: vendor.user_id,
        vendor_email: vendor.email,
        account_id: acct.id,
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
        requirements: refreshed.requirements,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, raw: e?.raw }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
