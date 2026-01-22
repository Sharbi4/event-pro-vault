-- Add Stripe Connect fields to markets table for market manager payouts
ALTER TABLE public.markets
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_account_status TEXT DEFAULT 'not_started';

-- Add comment for clarity
COMMENT ON COLUMN public.markets.stripe_account_id IS 'Stripe Connect account ID for this market';
COMMENT ON COLUMN public.markets.stripe_account_status IS 'Status: not_started, pending, pending_verification, active';