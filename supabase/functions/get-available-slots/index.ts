// Returns bookable time slots for a vendor + package + date.
// POST {
//   vendor_user_id: string,
//   package_id?: string,        // pulls duration/setup/breakdown if given
//   date: 'YYYY-MM-DD',
//   mode?: 'HOURLY'|'DAILY',    // overrides package
//   duration_minutes?: number,  // overrides package
//   setup_minutes?: number,
//   breakdown_minutes?: number,
//   interval_minutes?: number,  // step (default 30)
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  computeBookableSlots,
  bookingBlocksCalendar,
  type BookingMode,
  type OccupiedRange,
} from "../_shared/availabilityEngine.ts";
import { DEFAULT_TIMEZONE } from "../_shared/timezone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const {
    vendor_user_id,
    package_id,
    date,
    mode: modeIn,
    duration_minutes: durIn,
    setup_minutes: setupIn,
    breakdown_minutes: breakdownIn,
    interval_minutes,
  } = body;

  if (!vendor_user_id || !date) {
    return json({ error: "vendor_user_id and date are required" }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: "date must be YYYY-MM-DD" }, 400);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Package requirements (if provided)
  let mode: BookingMode = (modeIn === 'DAILY' ? 'DAILY' : 'HOURLY');
  let durationMinutes = Number(durIn) || 60;
  let setupMinutes = Number(setupIn) || 0;
  let breakdownMinutes = Number(breakdownIn) || 0;

  if (package_id) {
    const { data: pkg } = await sb
      .from("vendor_packages")
      .select("type, pricing_type, duration_minutes, setup_time_minutes, breakdown_time_minutes")
      .eq("id", package_id)
      .maybeSingle();
    if (pkg) {
      const pType = String(pkg.type || pkg.pricing_type || '').toUpperCase();
      mode = (modeIn ?? (pType === 'DAILY' || pType === 'DAY' ? 'DAILY' : 'HOURLY')) as BookingMode;
      if (durIn === undefined) durationMinutes = pkg.duration_minutes ?? durationMinutes;
      if (setupIn === undefined) setupMinutes = pkg.setup_time_minutes ?? 0;
      if (breakdownIn === undefined) breakdownMinutes = pkg.breakdown_time_minutes ?? 0;
    }
  }

  // 2. Vendor rules + buffers + timezone
  const [{ data: rules }, { data: vendorTz }] = await Promise.all([
    sb.from("vendor_buffer_settings")
      .select("buffer_before_minutes, buffer_after_minutes, minimum_notice_hours, advance_booking_days")
      .eq("user_id", vendor_user_id)
      .maybeSingle(),
    sb.from("vendor_details")
      .select("timezone")
      .eq("user_id", vendor_user_id)
      .maybeSingle(),
  ]);
  const timezone: string = (vendorTz?.timezone as string) || DEFAULT_TIMEZONE;

  // 3. Weekly windows
  const { data: weekly } = await sb
    .from("vendor_weekly_availability")
    .select("day_of_week, start_time, end_time, is_enabled")
    .eq("user_id", vendor_user_id);

  // 4. Recurring weekly day-blocks (full days off)
  const { data: recurring } = await sb
    .from("vendor_recurring_availability")
    .select("day_of_week")
    .eq("user_id", vendor_user_id)
    .eq("is_blocked", true);

  const [y, mo, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  const isRecurringBlocked = (recurring ?? []).some((r: any) => r.day_of_week === dow);

  // 5. Full-day blocks
  const { data: blockedDayRows } = await sb
    .from("vendor_availability")
    .select("date")
    .eq("user_id", vendor_user_id)
    .eq("is_blocked", true)
    .eq("date", date);

  const blockedDays: string[] = [
    ...(blockedDayRows ?? []).map((b: any) => b.date),
    ...(isRecurringBlocked ? [date] : []),
  ];

  // 6. Occupied: partial-day blocks + active holds + bookings (lifecycle-aware)
  // Pull anything that touches the day (with generous padding for blocks
  // crossing midnight)
  const dayStartISO = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0)).toISOString();
  const dayEndISO = new Date(Date.UTC(y, mo - 1, d, 23, 59, 59)).toISOString();

  const [{ data: bts }, { data: holds }, { data: bookings }] = await Promise.all([
    sb.from("vendor_blocked_times")
      .select("block_start, block_end")
      .eq("user_id", vendor_user_id)
      .lt("block_start", dayEndISO)
      .gt("block_end", dayStartISO),
    sb.from("calendar_holds")
      .select("hold_start, hold_end")
      .eq("vendor_user_id", vendor_user_id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .lt("hold_start", dayEndISO)
      .gt("hold_end", dayStartISO),
    sb.from("bookings")
      .select("calendar_block_start, calendar_block_end, event_start_at, event_end_at, lifecycle_status, status")
      .eq("vendor_user_id", vendor_user_id)
      .or(
        // Either calendar_block_* or event_*_at touches the day
        `and(calendar_block_start.lt.${dayEndISO},calendar_block_end.gt.${dayStartISO}),and(event_start_at.lt.${dayEndISO},event_end_at.gt.${dayStartISO})`
      ),
  ]);

  const occupied: OccupiedRange[] = [];
  for (const r of bts ?? []) {
    occupied.push({ start: new Date(r.block_start), end: new Date(r.block_end) });
  }
  for (const r of holds ?? []) {
    occupied.push({ start: new Date(r.hold_start), end: new Date(r.hold_end) });
  }
  for (const b of bookings ?? []) {
    if (!bookingBlocksCalendar(b as any)) continue;
    const s = (b as any).calendar_block_start ?? (b as any).event_start_at;
    const e = (b as any).calendar_block_end ?? (b as any).event_end_at;
    if (!s || !e) continue;
    occupied.push({ start: new Date(s), end: new Date(e) });
  }

  // 7. Run engine
  const slots = computeBookableSlots({
    date,
    timezone,
    weeklyWindows: (weekly ?? []) as any,
    blockedDays,
    occupied,
    pkg: {
      durationMinutes,
      setupMinutes,
      breakdownMinutes,
      bufferBeforeMinutes: rules?.buffer_before_minutes ?? 0,
      bufferAfterMinutes: rules?.buffer_after_minutes ?? 0,
      mode,
    },
    intervalMinutes: Number(interval_minutes) || 30,
    minimumNoticeHours: rules?.minimum_notice_hours ?? 0,
    advanceBookingDays: rules?.advance_booking_days ?? 365,
  });

  return json({
    date,
    mode,
    duration_minutes: durationMinutes,
    setup_minutes: setupMinutes,
    breakdown_minutes: breakdownMinutes,
    buffer_before_minutes: rules?.buffer_before_minutes ?? 0,
    buffer_after_minutes: rules?.buffer_after_minutes ?? 0,
    slots,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
