// Timezone helpers shared by booking + availability code.
// Strategy: treat HH:MM as a wall-clock time in the vendor's IANA timezone
// and convert to a real UTC Date by measuring the tz's offset at that moment.
//
// A copy of this file lives at supabase/functions/_shared/timezone.ts so
// the edge functions can use the same logic without bundling browser-only code.

export const DEFAULT_TIMEZONE = 'America/New_York';

function tzOffsetMs(utcMs: number, timeZone: string): number {
  // Returns the offset (in ms) such that: localWallTime = utcMs + offset
  // i.e. how many ms the timezone is *ahead of* UTC at this instant.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asIfUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asIfUtc - utcMs;
}

/**
 * Convert a wall-clock date + HH:MM in the given IANA timezone to a real
 * UTC Date. Iterates once to account for DST transitions.
 */
export function wallTimeToUtc(
  dateYMD: string,
  hm: string,
  timeZone: string = DEFAULT_TIMEZONE,
): Date {
  const [y, mo, d] = dateYMD.split('-').map(Number);
  const [hStr, mStr] = (hm.length >= 5 ? hm : `${hm}:00`).split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  // First guess: treat the wall-clock as UTC.
  const guess = Date.UTC(y, mo - 1, d, h, m, 0);
  // Offset at the guess, then correct.
  let offset = tzOffsetMs(guess, timeZone);
  let utc = guess - offset;
  // Re-evaluate around the corrected instant to handle DST boundaries.
  offset = tzOffsetMs(utc, timeZone);
  utc = guess - offset;
  return new Date(utc);
}

/** Wall-clock minute-of-day (0-1440) for a real UTC instant in `timeZone`. */
export function utcToWallMinutes(utc: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(utc);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return Number(map.hour) * 60 + Number(map.minute);
}

/** YYYY-MM-DD (wall-clock date) for a real UTC instant in `timeZone`. */
export function utcToWallDate(utc: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return dtf.format(utc); // 'YYYY-MM-DD'
}

/** Day-of-week (0=Sun..6=Sat) of a YYYY-MM-DD interpreted as a wall date. */
export function wallDateDow(dateYMD: string): number {
  const [y, mo, d] = dateYMD.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}
