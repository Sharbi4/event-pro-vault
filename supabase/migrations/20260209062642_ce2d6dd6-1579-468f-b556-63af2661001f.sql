-- Add default start time for daily bookings
ALTER TABLE public.vendor_packages ADD COLUMN IF NOT EXISTS default_start_time TEXT;
-- Add min_days field for daily bookings
ALTER TABLE public.vendor_packages ADD COLUMN IF NOT EXISTS min_days INTEGER DEFAULT 1;

COMMENT ON COLUMN public.vendor_packages.default_start_time IS 'Default start time for daily bookings in HH:mm format';
COMMENT ON COLUMN public.vendor_packages.min_days IS 'Minimum number of days for daily bookings';