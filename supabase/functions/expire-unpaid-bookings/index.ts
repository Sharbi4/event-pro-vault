// Cron: mark unpaid online Instant-Book bookings older than 24h as expired.
// Cash bookings, Request-to-Book bookings, and any booking with a captured
// payment are left alone.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: "expired",
      cancelled_at: new Date().toISOString(),
    })
    .eq("payment_method", "stripe")
    .eq("booking_mode", "INSTANT")
    .is("deposit_paid_at", null)
    .is("final_paid_at", null)
    .in("payment_status", ["pending"])
    .not("status", "in", "(cancelled,declined,expired,completed,refunded)")
    .lte("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("[expire-unpaid-bookings]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      expired: data?.length ?? 0,
      cutoff,
      at: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
