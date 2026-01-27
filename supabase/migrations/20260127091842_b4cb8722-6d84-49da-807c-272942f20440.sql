-- Drop old constraints and add new ones with all required values
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add updated status constraint with awaiting_payment and declined
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status = ANY (ARRAY['pending', 'awaiting_payment', 'confirmed', 'completed', 'cancelled', 'declined']));

-- Add updated payment_status constraint with cash_due and other values
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status = ANY (ARRAY['pending', 'awaiting_approval', 'paid', 'deposit_paid', 'cash_due', 'failed', 'refunded', 'declined']));