-- Add payment tracking fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN stripe_checkout_session_id TEXT,
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN payment_amount INTEGER,
ADD COLUMN customer_email TEXT;