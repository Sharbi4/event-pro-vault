// Atomically create a 15-minute checkout hold on a vendor's calendar.
// POST { vendor_user_id, start_at, end_at, package_id?, hold_minutes? (default 15) }
// Auth required.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_HOLD_MINUTES = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsErr || !claims?.claims?.sub) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userId = claims.claims.sub as string;
  const userEmail = (claims.claims.email as string | undefined) ?? null;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { vendor_user_id, start_at, end_at, package_id, hold_minutes } = body;
  if (!vendor_user_id || !start_at || !end_at) {
    return json({ error: "vendor_user_id, start_at, end_at required" }, 400);
  }
  const start = new Date(start_at);
  const end = new Date(end_at);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return json({ error: "invalid time range" }, 400);
  }

  const minutes = Math.max(1, Math.min(60, Number(hold_minutes) || DEFAULT_HOLD_MINUTES));
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Re-check availability (excluding any hold this user might already have for this package)
  const checkRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-vendor-availability`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ vendor_user_id, start_at, end_at }),
    },
  );
  const check = await checkRes.json();
  if (!check.available) {
    return json({ error: "Time slot is no longer available", conflicts: check.conflicts }, 409);
  }

  // 2. Release any prior active holds this user has for this vendor (only one active hold at a time)
  await sb
    .from("calendar_holds")
    .update({ status: "released" })
    .eq("vendor_user_id", vendor_user_id)
    .eq("customer_user_id", userId)
    .eq("status", "active");

  // 3. Insert new hold
  const { data: hold, error } = await sb
    .from("calendar_holds")
    .insert({
      vendor_user_id,
      customer_user_id: userId,
      customer_email: userEmail,
      package_id: package_id ?? null,
      hold_start: start.toISOString(),
      hold_end: end.toISOString(),
      status: "active",
      source: "checkout",
      expires_at: expiresAt.toISOString(),
    })
    .select("id, expires_at, hold_start, hold_end")
    .single();

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({
    hold_id: hold.id,
    expires_at: hold.expires_at,
    hold_start: hold.hold_start,
    hold_end: hold.hold_end,
    seconds_remaining: Math.floor((new Date(hold.expires_at).getTime() - Date.now()) / 1000),
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
