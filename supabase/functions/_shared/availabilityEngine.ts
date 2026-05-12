// Shared availability engine — pure functions used by both client (src/lib)
// and edge functions (copy lives at supabase/functions/_shared/availabilityEngine.ts).
//
// All wall-clock <-> real-UTC conversions use the Event Pro's IANA timezone
// via src/lib/timezone.ts (mirrored at supabase/functions/_shared/timezone.ts).
// This guarantees that a slot shown in search resolves to the same instant
// when the booking is created and when other vendors' bookings are compared.

import { DEFAULT_TIMEZONE, utcToWallMinutes, utcToWallDate, wallDateDow, wallTimeToUtc } from '../_shared/timezone.ts';

export type BookingMode = 'HOURLY' | 'DAILY';

export type BlockingLifecycle =
  | 'pending_vendor_approval'
  | 'approved_payment_required'
  | 'payment_pending'
  | 'confirmed'
  | 'in_progress';

/** Lifecycle statuses that consume Event Pro calendar capacity. */
export const BLOCKING_LIFECYCLE_STATUSES: ReadonlySet<string> = new Set<BlockingLifecycle>([
  'pending_vendor_approval',
  'approved_payment_required',
  'payment_pending',
  'confirmed',
  'in_progress',
]);

/** Legacy `bookings.status` values we still respect when lifecycle is null. */
export const BLOCKING_LEGACY_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'awaiting_payment',
  'approved',
  'paid',
  'confirmed',
  'in_progress',
]);

/** Returns true when this booking row should block the calendar. */
export function bookingBlocksCalendar(row: {
  lifecycle_status?: string | null;
  status?: string | null;
}): boolean {
  if (row.lifecycle_status) return BLOCKING_LIFECYCLE_STATUSES.has(row.lifecycle_status);
  if (row.status) return BLOCKING_LEGACY_STATUSES.has(row.status);
  return false;
}

export interface WeeklyWindow {
  day_of_week: number; // 0=Sun … 6=Sat
  start_time: string;  // 'HH:MM' or 'HH:MM:SS'
  end_time: string;
  is_enabled: boolean;
}

export interface OccupiedRange {
  start: Date;
  end: Date;
}

export interface PackageRequirements {
  durationMinutes: number;          // service face-time
  setupMinutes: number;             // arrive-early
  breakdownMinutes: number;         // tear-down
  bufferBeforeMinutes: number;      // travel/cushion before
  bufferAfterMinutes: number;       // travel/cushion after
  mode: BookingMode;
  /** For DAILY mode: how many full days the package consumes (default 1). */
  dayUnits?: number;
}

export interface SlotEngineInput {
  /** Event Pro-local date the customer wants (YYYY-MM-DD). */
  date: string;
  /** IANA timezone for the vendor (e.g. 'America/New_York'). */
  timezone?: string;
  /** Weekly windows (already filtered to this user). */
  weeklyWindows: WeeklyWindow[];
  /** Hard "all-day" blocks that knock out the date entirely (YYYY-MM-DD strings). */
  blockedDays: string[];
  /** Partial-day blocks + active holds + blocking bookings (combined). */
  occupied: OccupiedRange[];
  pkg: PackageRequirements;
  /** Step granularity in minutes for hourly slots. */
  intervalMinutes?: number;
  /** Treated as "now" for min-notice math. */
  now?: Date;
  /** Event Pro-level guard: hours before event the customer must book. */
  minimumNoticeHours?: number;
  /** Event Pro-level guard: max days into the future. */
  advanceBookingDays?: number;
}

export interface BookableSlot {
  /** Customer-facing start "HH:MM". */
  start: string;
  /** Customer-facing end "HH:MM". */
  end: string;
  /** Calendar block start ISO (event_start - setup - bufferBefore). */
  blockStartISO: string;
  /** Calendar block end ISO   (event_end + breakdown + bufferAfter). */
  blockEndISO: string;
}

/** Turn 'HH:MM' or 'HH:MM:SS' into minutes since midnight. */
function hmToMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function minToHM(min: number): string {
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

/**
 * Build an ISO UTC string from a YYYY-MM-DD wall date + signed minute-of-day
 * (can be negative for "setup that crosses midnight") in the given IANA tz.
 */
function isoFromDateAndMin(date: string, minutes: number, tz: string): string {
  // Anchor at 00:00 wall-clock of `date` in `tz`, then add minutes.
  const anchor = wallTimeToUtc(date, '00:00', tz).getTime();
  return new Date(anchor + minutes * 60_000).toISOString();
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/** Core engine. Returns slots already filtered for every constraint. */
export function computeBookableSlots(input: SlotEngineInput): BookableSlot[] {
  const {
    date,
    timezone = DEFAULT_TIMEZONE,
    weeklyWindows,
    blockedDays,
    occupied,
    pkg,
    intervalMinutes = 30,
    now = new Date(),
    minimumNoticeHours = 0,
    advanceBookingDays = 365,
  } = input;

  // 0. Hard guards
  if (blockedDays.includes(date)) return [];

  const dayOfWeek = wallDateDow(date);
  // Vendor-local midnight as a real UTC instant.
  const dayStartMs = wallTimeToUtc(date, '00:00', timezone).getTime();
  const daysAhead = (dayStartMs - now.getTime()) / 86_400_000;
  if (daysAhead > advanceBookingDays) return [];

  // 1. Resolve weekly windows for this dow (multiple allowed)
  const windows = weeklyWindows
    .filter(w => w.day_of_week === dayOfWeek && w.is_enabled)
    .map(w => ({ startMin: hmToMin(w.start_time), endMin: hmToMin(w.end_time) }))
    .filter(w => w.endMin > w.startMin)
    .sort((a, b) => a.startMin - b.startMin);
  if (windows.length === 0) return [];

  // 2. DAILY mode: a single all-day commitment
  if (pkg.mode === 'DAILY') {
    const startMin = windows[0].startMin;
    const endMin = windows[windows.length - 1].endMin;
    const blockStartMin = startMin - pkg.setupMinutes - pkg.bufferBeforeMinutes;
    const blockEndMin = endMin + pkg.breakdownMinutes + pkg.bufferAfterMinutes;
    const blockStartISO = isoFromDateAndMin(date, blockStartMin, timezone);
    const blockEndISO = isoFromDateAndMin(date, blockEndMin, timezone);

    if (new Date(blockStartISO).getTime() - now.getTime() < minimumNoticeHours * 3_600_000) {
      return [];
    }
    const bs = new Date(blockStartISO).getTime();
    const be = new Date(blockEndISO).getTime();
    for (const o of occupied) {
      if (rangesOverlap(bs, be, o.start.getTime(), o.end.getTime())) return [];
    }
    return [{
      start: minToHM(startMin),
      end: minToHM(endMin),
      blockStartISO,
      blockEndISO,
    }];
  }

  // 3. HOURLY mode: iterate each window in step increments
  const totalServiceMin = pkg.durationMinutes;
  const padBefore = pkg.setupMinutes + pkg.bufferBeforeMinutes;
  const padAfter = pkg.breakdownMinutes + pkg.bufferAfterMinutes;
  const noticeCutoff = now.getTime() + minimumNoticeHours * 3_600_000;

  // Project occupied UTC ranges to minute offsets relative to vendor-local
  // midnight. This makes overlap comparisons trivial and timezone-correct.
  const occMinutes = occupied.map(o => ({
    s: (o.start.getTime() - dayStartMs) / 60_000,
    e: (o.end.getTime() - dayStartMs) / 60_000,
  }));

  const out: BookableSlot[] = [];
  for (const win of windows) {
    let cursor = win.startMin;
    while (cursor + totalServiceMin <= win.endMin) {
      const eventStart = cursor;
      const eventEnd = cursor + totalServiceMin;
      const blockStart = eventStart - padBefore;
      const blockEnd = eventEnd + padAfter;

      const eventStartMs = dayStartMs + eventStart * 60_000;
      if (eventStartMs >= noticeCutoff) {
        let conflict = false;
        for (const o of occMinutes) {
          if (rangesOverlap(blockStart, blockEnd, o.s, o.e)) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          out.push({
            start: minToHM(eventStart),
            end: minToHM(eventEnd),
            blockStartISO: isoFromDateAndMin(date, blockStart, timezone),
            blockEndISO: isoFromDateAndMin(date, blockEnd, timezone),
          });
        }
      }
      cursor += intervalMinutes;
    }
  }
  return out;
}

// Re-export for callers that want timezone helpers alongside the engine.
export { DEFAULT_TIMEZONE, utcToWallMinutes, utcToWallDate } from '../_shared/timezone.ts';
