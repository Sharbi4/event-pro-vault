-- Add new optional verification + payout fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS trust_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS online_payments_enabled boolean NOT NULL DEFAULT true;

-- Backfill is_identity_verified + identity_verified_at for already-verified vendors
UPDATE public.profiles
   SET is_identity_verified = true,
       identity_verified_at = COALESCE(identity_verified_at, updated_at)
 WHERE identity_verification_status = 'verified'
   AND is_identity_verified = false;

-- Trigger: keep is_identity_verified + identity_verified_at in sync with identity_verification_status
CREATE OR REPLACE FUNCTION public.sync_identity_verified_flag()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.identity_verification_status IS DISTINCT FROM OLD.identity_verification_status THEN
    IF NEW.identity_verification_status = 'verified' THEN
      NEW.is_identity_verified := true;
      IF NEW.identity_verified_at IS NULL THEN
        NEW.identity_verified_at := now();
      END IF;
    ELSE
      NEW.is_identity_verified := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_identity_verified ON public.profiles;
CREATE TRIGGER profiles_sync_identity_verified
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_identity_verified_flag();

-- Relax public visibility: drop Stripe Connect requirement, keep admin approval gate
DROP POLICY IF EXISTS "Public can view approved vendor profiles" ON public.profiles;

CREATE POLICY "Public can view approved vendor profiles"
  ON public.profiles
  FOR SELECT
  USING (
    ((is_vendor = true) AND (approval_status = 'approved'))
    OR (auth.uid() = user_id)
  );