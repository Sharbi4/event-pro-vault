-- Backfill master calendar fields for bookings created before the
-- end_time auto-derivation fix. Any booking that has a start_time but is
-- missing event_start_at/event_end_at/calendar_block_start/end gets a
-- derived window from start_time + duration_minutes (plus setup/breakdown).
-- Only touches blocking statuses so cancelled rows stay untouched.
UPDATE public.bookings
SET
  end_time = COALESCE(
    end_time,
    (start_time + (COALESCE(duration_minutes, 60) || ' minutes')::interval)::time
  ),
  event_start_at = COALESCE(
    event_start_at,
    (event_date::timestamp + start_time) AT TIME ZONE COALESCE(event_timezone, 'America/New_York')
  ),
  event_end_at = COALESCE(
    event_end_at,
    ((event_date::timestamp + start_time) + (COALESCE(duration_minutes, 60) || ' minutes')::interval)
      AT TIME ZONE COALESCE(event_timezone, 'America/New_York')
  ),
  calendar_block_start = COALESCE(
    calendar_block_start,
    ((event_date::timestamp + start_time) - (COALESCE(setup_minutes, 0) || ' minutes')::interval)
      AT TIME ZONE COALESCE(event_timezone, 'America/New_York')
  ),
  calendar_block_end = COALESCE(
    calendar_block_end,
    ((event_date::timestamp + start_time)
       + (COALESCE(duration_minutes, 60) || ' minutes')::interval
       + (COALESCE(breakdown_minutes, 0) || ' minutes')::interval)
      AT TIME ZONE COALESCE(event_timezone, 'America/New_York')
  )
WHERE start_time IS NOT NULL
  AND event_date IS NOT NULL
  AND (event_start_at IS NULL OR event_end_at IS NULL
       OR calendar_block_start IS NULL OR calendar_block_end IS NULL
       OR end_time IS NULL)
  AND COALESCE(lifecycle_status, status) NOT IN (
    'cancelled', 'canceled', 'cancelled_by_customer', 'cancelled_by_vendor',
    'declined_by_vendor', 'expired', 'refunded'
  );