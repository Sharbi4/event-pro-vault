-- Add deposit and final payment tracking to bookings
ALTER TABLE public.bookings
ADD COLUMN deposit_amount INTEGER DEFAULT 0,
ADD COLUMN deposit_percentage INTEGER DEFAULT 50,
ADD COLUMN final_amount INTEGER DEFAULT 0,
ADD COLUMN deposit_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN final_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN vendor_stripe_account_id TEXT,
ADD COLUMN platform_fee_amount INTEGER DEFAULT 0,
ADD COLUMN stripe_deposit_payment_intent_id TEXT,
ADD COLUMN stripe_final_payment_intent_id TEXT;