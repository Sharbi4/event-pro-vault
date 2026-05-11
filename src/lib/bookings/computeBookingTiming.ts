// Pure helper that computes master-calendar timing fields for a booking.
// Extracted so it can be unit-tested independently of Supabase.
//
// Business rules:
//   1. event_start_at  = event_date + start_time (local-ISO; caller decides tz)
//   2. event_end_at    = event_date + end_time, OR start + duration_minutes
//                        when end_time is not supplied (non-hourly packages).
//   3. If end <= start (crosses midnight) push end to the next day.
//   4. calendar_block_start = event_start_at - setup_minutes
//      calendar_block_end   = event_end_at   + breakdown_minutes
//   5. end_time is always persisted (derived if necessary) so cross-package
//      availability queries can detect conflicts without ISO timestamps.
//   6. Returns nulls when start_time/event_date are missing so callers can
//      still insert a row (legacy / data-only bookings).

export interface BookingTimingInput {
  event_date?: string | null;        // YYYY-MM-DD
  start_time?: string | null;        // HH:MM or HH:MM:SS
  end_time?: string | null;          // HH:MM or HH:MM:SS, optional
  duration_minutes?: number | null;  // service duration
  setup_minutes?: number | null;
  breakdown_minutes?: number | null;
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
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function computeBookingTiming(input: BookingTimingInput): BookingTiming {
  const setupMin = input.setup_minutes ?? 0;
  const breakdownMin = input.breakdown_minutes ?? 0;
  const durationMin = input.duration_minutes ?? 60;

  const result: BookingTiming = {
    end_time: input.end_time || null,
    event_start_at: null,
    event_end_at: null,
    calendar_block_start: null,
    calendar_block_end: null,
    duration_minutes: durationMin,
    setup_minutes: setupMin,
    breakdown_minutes: breakdownMin,
  };

  if (!input.event_date || !input.start_time) return result;

  const start = new Date(`${input.event_date}T${input.start_time}`);
  let end: Date;
  if (input.end_time) {
    end = new Date(`${input.event_date}T${input.end_time}`);
  } else {
    end = new Date(start.getTime() + durationMin * 60_000);
  }
  // Cross-midnight: bump end into the next day.
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return result;

  result.event_start_at = start.toISOString();
  result.event_end_at = end.toISOString();
  result.calendar_block_start = new Date(start.getTime() - setupMin * 60_000).toISOString();
  result.calendar_block_end = new Date(end.getTime() + breakdownMin * 60_000).toISOString();

  if (!result.end_time) {
    result.end_time = `${pad2(end.getHours())}:${pad2(end.getMinutes())}:00`;
  }
  return result;
}
