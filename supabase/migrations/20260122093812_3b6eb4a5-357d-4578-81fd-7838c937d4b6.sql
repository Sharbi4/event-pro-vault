-- Add payment_method column to bookings table to track customer's selected payment method
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'stripe';

-- Add comment for clarity
COMMENT ON COLUMN public.bookings.payment_method IS 'Customer selected payment method: stripe, cash, or null if vendor only accepts one method';