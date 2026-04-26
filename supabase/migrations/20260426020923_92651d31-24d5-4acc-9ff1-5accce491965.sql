-- vendor_packages: per-package payment mode + in-person balance toggle
ALTER TABLE public.vendor_packages
  ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS deposit_percentage integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS allow_in_person_balance boolean NOT NULL DEFAULT false;

ALTER TABLE public.vendor_packages
  DROP CONSTRAINT IF EXISTS vendor_packages_payment_mode_check;
ALTER TABLE public.vendor_packages
  ADD CONSTRAINT vendor_packages_payment_mode_check
  CHECK (payment_mode IN ('full','deposit'));

ALTER TABLE public.vendor_packages
  DROP CONSTRAINT IF EXISTS vendor_packages_deposit_percentage_check;
ALTER TABLE public.vendor_packages
  ADD CONSTRAINT vendor_packages_deposit_percentage_check
  CHECK (deposit_percentage BETWEEN 10 AND 90);

-- reviews: vendor reply + tags + photos
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS vendor_reply text,
  ADD COLUMN IF NOT EXISTS vendor_reply_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}'::text[];

-- Allow vendors to update their reply on reviews left for them
DROP POLICY IF EXISTS "Vendors can reply to reviews on their listings" ON public.reviews;
CREATE POLICY "Vendors can reply to reviews on their listings"
ON public.reviews
FOR UPDATE
USING (auth.uid() = vendor_user_id)
WITH CHECK (auth.uid() = vendor_user_id);

-- Helpful index for fetching reviews per booking
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_reviews_booking_reviewer
  ON public.reviews(booking_id, reviewer_user_id)
  WHERE booking_id IS NOT NULL;