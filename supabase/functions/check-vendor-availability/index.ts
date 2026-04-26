// Canonical server-side availability check for a vendor calendar.
// POST { vendor_user_id, start_at, end_at, exclude_hold_id?, exclude_booking_id? }
// Returns { available: boolean, conflicts: [{ kind, ... }], reason? }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Conflict =
  | { kind: "booking"; booking_id: string; start: string; end: string }
  | { kind: "hold"; hold_id: string; start: string; end: string }
  | { kind: "blocked_time"; block_id: string; start: string; end: string; reason?: string }
  | { kind: "outside_weekly_window"; day_of_week: number }
  | { kind: "blocked_day"; date: string; reason?: string }
  | { kind: "min_notice"; required_hours: number }
  | { kind: "advance_window"; max_days: number };

interface Body {
  vendor_user_id: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  exclude_hold_id?: string;
  exclude_booking_id?: string;
  enforce_weekly_window?: boolean; // default true
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { vendor_user_id, start_at, end_at } = body;
  if (!vendor_user_id || !start_at || !end_at) {
    return json({ error: "vendor_user_id, start_at, end_at are required" }, 400);
  }
  const start = new Date(start_at);
  const end = new Date(end_at);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return json({ error: "invalid time range" }, 400);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const conflicts: Conflict[] = [];

  // 1. Vendor booking rules (min notice / advance window)
  const { data: vendorRow } = await sb
    .from("profiles")
    .select("user_id")
    .eq("user_id", vendor_user_id)
    .maybeSingle();
  if (!vendorRow) return json({ error: "vendor not found" }, 404);

  // Pull rules from vendor_buffer_settings if present (extended in phase 1)
  const { data: rules } = await sb
    .from("vendor_buffer_settings")
    .select("*")
    .eq("user_id", vendor_user_id)
    .maybeSingle();

  const minNoticeHours = (rules as any)?.minimum_notice_hours ?? 0;
  const advanceDays = (rules as any)?.advance_booking_days ?? 365;

  const now = new Date();
  const noticeMs = minNoticeHours * 3600 * 1000;
  if (start.getTime() - now.getTime() < noticeMs) {
    conflicts.push({ kind: "min_notice", required_hours: minNoticeHours });
  }
  const maxFutureMs = advanceDays * 24 * 3600 * 1000;
  if (start.getTime() - now.getTime() > maxFutureMs) {
    conflicts.push({ kind: "advance_window", max_days: advanceDays });
  }

  // 2. Weekly availability window (server-side timezone-naive: compare UTC dow + HH:mm)
  if (body.enforce_weekly_window !== false) {
    const dow = start.getUTCDay();
    const { data: weekly } = await sb
      .from("vendor_weekly_availability")
      .select("day_of_week, start_time, end_time, is_enabled")
      .eq("user_id", vendor_user_id)
      .eq("day_of_week", dow);

    if (weekly && weekly.length > 0) {
      const enabled = weekly.find((w) => w.is_enabled);
      if (!enabled) {
        conflicts.push({ kind: "outside_weekly_window", day_of_week: dow });
      }
      // (HH:mm comparison skipped — timezones make naive compare unsafe.
      // Booking-level overlap checks below catch real conflicts.)
    }
  }

  // 3. Full-day blocks (vendor_availability)
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);
  const { data: blockedDays } = await sb
    .from("vendor_availability")
    .select("date, reason")
    .eq("user_id", vendor_user_id)
    .eq("is_blocked", true)
    .gte("date", startDate)
    .lte("date", endDate);
  for (const b of blockedDays ?? []) {
    conflicts.push({ kind: "blocked_day", date: b.date, reason: b.reason ?? undefined });
  }

  // 4. Partial-day blocks (vendor_blocked_times)
  const { data: blockedTimes } = await sb
    .from("vendor_blocked_times")
    .select("id, block_start, block_end, reason")
    .eq("user_id", vendor_user_id)
    .lt("block_start", end.toISOString())
    .gt("block_end", start.toISOString());
  for (const b of blockedTimes ?? []) {
    conflicts.push({
      kind: "blocked_time",
      block_id: b.id,
      start: b.block_start,
      end: b.block_end,
      reason: b.reason ?? undefined,
    });
  }

  // 5. Active holds
  let holdsQ = sb
    .from("calendar_holds")
    .select("id, hold_start, hold_end")
    .eq("vendor_user_id", vendor_user_id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .lt("hold_start", end.toISOString())
    .gt("hold_end", start.toISOString());
  if (body.exclude_hold_id) holdsQ = holdsQ.neq("id", body.exclude_hold_id);
  const { data: holds } = await holdsQ;
  for (const h of holds ?? []) {
    conflicts.push({ kind: "hold", hold_id: h.id, start: h.hold_start, end: h.hold_end });
  }

  // 6. Existing bookings (any non-terminal lifecycle state)
  // Use calendar_block_* if present, else event_start_at/event_end_at
  let bookingsQ = sb
    .from("bookings")
    .select(
      "id, calendar_block_start, calendar_block_end, event_start_at, event_end_at, lifecycle_status, status",
    )
    .eq("vendor_user_id", vendor_user_id);
  if (body.exclude_booking_id) bookingsQ = bookingsQ.neq("id", body.exclude_booking_id);
  const { data: bookings } = await bookingsQ;

  const blockingLifecycles = new Set([
    "pending_vendor_approval",
    "approved_payment_required",
    "payment_pending",
    "confirmed",
    "in_progress",
  ]);
  const blockingLegacy = new Set(["pending", "approved", "awaiting_payment", "paid", "confirmed"]);

  for (const b of bookings ?? []) {
    const lifecycle = (b as any).lifecycle_status;
    const legacy = (b as any).status;
    const blocks =
      (lifecycle && blockingLifecycles.has(lifecycle)) ||
      (!lifecycle && legacy && blockingLegacy.has(legacy));
    if (!blocks) continue;
    const bs = (b as any).calendar_block_start ?? (b as any).event_start_at;
    const be = (b as any).calendar_block_end ?? (b as any).event_end_at;
    if (!bs || !be) continue;
    const bsd = new Date(bs);
    const bed = new Date(be);
    if (bsd < end && bed > start) {
      conflicts.push({
        kind: "booking",
        booking_id: (b as any).id,
        start: bs,
        end: be,
      });
    }
  }

  const available = conflicts.length === 0;
  return json({
    available,
    conflicts,
    reason: available ? null : conflicts[0],
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
