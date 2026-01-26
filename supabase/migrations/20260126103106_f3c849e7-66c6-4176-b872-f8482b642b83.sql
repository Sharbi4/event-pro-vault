-- Add structured address fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS event_city text,
ADD COLUMN IF NOT EXISTS event_state text,
ADD COLUMN IF NOT EXISTS event_zip text;

-- Add structured address fields to slot_bookings table for market vendor bookings
ALTER TABLE public.slot_bookings
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS vendor_city text,
ADD COLUMN IF NOT EXISTS vendor_state text,
ADD COLUMN IF NOT EXISTS vendor_zip text;

-- Add structured address fields to vendor_details for business address
ALTER TABLE public.vendor_details
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS zip_code text;