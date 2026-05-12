// Pure helper that computes master-calendar timing fields for a booking.
// Extracted so it can be unit-tested independently of Supabase.
//
// All wall-clock → real-UTC conversions use the Event Pro's IANA timezone
// (defaults to America/New_York to match the bookings.event_timezone column
// default) so the timestamps stored on the booking match the slot the
// customer selected and what gets shown on confirmation.

import { DEFAULT_TIMEZONE, wallTimeToUtc } from '@/lib/timezone';

export interface BookingTimingInput {
  event_date?: string | null;        // YYYY-MM-DD
  start_time?: string | null;        // HH:MM or HH:MM:SS
  end_time?: string | null;          // HH:MM or HH:MM:SS, optional
  duration_minutes?: number | null;  // service duration
  setup_minutes?: number | null;
  breakdown_minutes?: number | null;
  /** IANA timezone for the Event Pro (defaults to America/New_York). */
  timezone?: string | null;
}

export interface BookingTiming {
  end_time: string | null;             // HH:MM:SS
  event_start_at: string | null;       // ISO
  event_end_at: string | null;         // ISO
  calendar_block_start: string | null; // ISO (includes setup buffer)
  calendar_block_end: string | null;   // ISO (includes breakdown buffer)
  duration_minutes: number;            // resolved (default 60)
  setup_minutes: number;
  breakdown_minutes: number;
  timezone: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function computeBookingTiming(input: BookingTimingInput): BookingTiming {
  const setupMin = input.setup_minutes ?? 0;
  const breakdownMin = input.breakdown_minutes ?? 0;
  const durationMin = input.duration_minutes ?? 60;
  const timezone = input.timezone || DEFAULT_TIMEZONE;

  const result: BookingTiming = {
    end_time: input.end_time || null,
    event_start_at: null,
    event_end_at: null,
    calendar_block_start: null,
    calendar_block_end: null,
    duration_minutes: durationMin,
    setup_minutes: setupMin,
    breakdown_minutes: breakdownMin,
    timezone,
  };

  if (!input.event_date || !input.start_time) return result;

  const start = wallTimeToUtc(input.event_date, input.start_time, timezone);
  let end: Date;
  if (input.end_time) {
    end = wallTimeToUtc(input.event_date, input.end_time, timezone);
  } else {
    end = new Date(start.getTime() + durationMin * 60_000);
  }
  // Cross-midnight: bump end into the next day.
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 86_400_000);
  }
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return result;

  result.event_start_at = start.toISOString();
  result.event_end_at = end.toISOString();
  result.calendar_block_start = new Date(start.getTime() - setupMin * 60_000).toISOString();
  result.calendar_block_end = new Date(end.getTime() + breakdownMin * 60_000).toISOString();

  if (!result.end_time) {
    // Derive the wall-clock HH:MM:SS in the Event Pro's tz so the value
    // persisted matches what the customer picked.
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hourCycle: 'h23',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = dtf.formatToParts(end);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    result.end_time = `${pad2(Number(map.hour))}:${pad2(Number(map.minute))}:${pad2(Number(map.second))}`;
  }
  return result;
}

