-- Add start_time and end_time columns to bookings table for time-slot based availability
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS start_time time without time zone,
ADD COLUMN IF NOT EXISTS end_time time without time zone,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS setup_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS breakdown_minutes integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.bookings.start_time IS 'Event start time for time-slot availability checking';
COMMENT ON COLUMN public.bookings.end_time IS 'Event end time (calculated from start_time + duration)';
COMMENT ON COLUMN public.bookings.duration_minutes IS 'Total service duration in minutes';
COMMENT ON COLUMN public.bookings.setup_minutes IS 'Buffer time before event for vendor setup';
COMMENT ON COLUMN public.bookings.breakdown_minutes IS 'Buffer time after event for vendor breakdown';

-- Create index for efficient availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_date_time 
ON public.bookings (vendor_user_id, event_date, start_time)
WHERE status IN ('confirmed', 'pending');