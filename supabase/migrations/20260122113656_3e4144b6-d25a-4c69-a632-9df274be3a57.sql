-- Add booking mode and payment options to vendor_packages
ALTER TABLE public.vendor_packages
ADD COLUMN IF NOT EXISTS booking_mode text NOT NULL DEFAULT 'INSTANT',
ADD COLUMN IF NOT EXISTS payment_options text NOT NULL DEFAULT 'ONLINE';

-- Add comment for documentation
COMMENT ON COLUMN public.vendor_packages.booking_mode IS 'INSTANT or REQUEST - whether booking is instant or requires approval';
COMMENT ON COLUMN public.vendor_packages.payment_options IS 'ONLINE, CASH, or BOTH - accepted payment methods';

-- Update bookings table for new payment statuses
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS booking_mode text DEFAULT 'INSTANT';

-- Add check constraint for valid values (using validation approach)
-- Note: We'll validate in application code since check constraints can be problematic