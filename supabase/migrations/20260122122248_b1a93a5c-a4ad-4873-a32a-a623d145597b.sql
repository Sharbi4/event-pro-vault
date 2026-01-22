-- Allow guest bookings by making user_id nullable in slot_bookings
-- The user_id will be null for guest checkouts

ALTER TABLE public.slot_bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id or vendor_email is present
ALTER TABLE public.slot_bookings 
ADD CONSTRAINT guest_booking_email_required 
CHECK (user_id IS NOT NULL OR vendor_email IS NOT NULL);

-- Update RLS policies to allow guest bookings to be inserted
DROP POLICY IF EXISTS "Users can insert their own slot bookings" ON public.slot_bookings;

CREATE POLICY "Anyone can insert slot bookings with email" 
ON public.slot_bookings 
FOR INSERT 
WITH CHECK (
  -- Either authenticated user inserting their own booking
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  -- Or guest booking with email provided
  OR (user_id IS NULL AND vendor_email IS NOT NULL)
);

-- Allow guests to view their own bookings by session ID (via edge function with service role)
-- The existing SELECT policies are fine since they use auth.uid() which won't match for guests
-- Guests will verify their booking via the checkout session ID through edge functions

-- Also update bookings table for event pro guest checkout
ALTER TABLE public.bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or customer_email is present
ALTER TABLE public.bookings 
ADD CONSTRAINT guest_booking_customer_email_required 
CHECK (user_id IS NOT NULL OR customer_email IS NOT NULL);

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings with email" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  -- Either authenticated user inserting their own booking
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  -- Or guest booking with email provided
  OR (user_id IS NULL AND customer_email IS NOT NULL)
);