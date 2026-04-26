-- =====================================================================
-- Phase 1 (idempotent retry): Master vendor calendar
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. vendor_weekly_availability
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_weekly_availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  day_of_week integer NOT NULL,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  is_enabled  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_weekly_avail_unique
  ON public.vendor_weekly_availability (user_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS vendor_weekly_avail_user_day
  ON public.vendor_weekly_availability (user_id, day_of_week);

ALTER TABLE public.vendor_weekly_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view vendor weekly availability"          ON public.vendor_weekly_availability;
DROP POLICY IF EXISTS "Vendors can insert their own weekly availability"    ON public.vendor_weekly_availability;
DROP POLICY IF EXISTS "Vendors can update their own weekly availability"    ON public.vendor_weekly_availability;
DROP POLICY IF EXISTS "Vendors can delete their own weekly availability"    ON public.vendor_weekly_availability;

CREATE POLICY "Public can view vendor weekly availability"
  ON public.vendor_weekly_availability FOR SELECT USING (true);
CREATE POLICY "Vendors can insert their own weekly availability"
  ON public.vendor_weekly_availability FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update their own weekly availability"
  ON public.vendor_weekly_availability FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can delete their own weekly availability"
  ON public.vendor_weekly_availability FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS vendor_weekly_avail_set_updated_at ON public.vendor_weekly_availability;
CREATE TRIGGER vendor_weekly_avail_set_updated_at
  BEFORE UPDATE ON public.vendor_weekly_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_weekly_availability()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.day_of_week < 0 OR NEW.day_of_week > 6 THEN
    RAISE EXCEPTION 'day_of_week must be between 0 and 6';
  END IF;
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_weekly_avail_validate ON public.vendor_weekly_availability;
CREATE TRIGGER vendor_weekly_avail_validate
  BEFORE INSERT OR UPDATE ON public.vendor_weekly_availability
  FOR EACH ROW EXECUTE FUNCTION public.validate_weekly_availability();

-- ---------------------------------------------------------------------
-- 2. vendor_blocked_times
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_blocked_times (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  block_start timestamptz NOT NULL,
  block_end   timestamptz NOT NULL,
  reason      text,
  is_full_day boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_blocked_times_user_range
  ON public.vendor_blocked_times (user_id, block_start, block_end);

ALTER TABLE public.vendor_blocked_times ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view vendor blocked times"          ON public.vendor_blocked_times;
DROP POLICY IF EXISTS "Vendors can insert their own blocked times"    ON public.vendor_blocked_times;
DROP POLICY IF EXISTS "Vendors can update their own blocked times"    ON public.vendor_blocked_times;
DROP POLICY IF EXISTS "Vendors can delete their own blocked times"    ON public.vendor_blocked_times;

CREATE POLICY "Public can view vendor blocked times"
  ON public.vendor_blocked_times FOR SELECT USING (true);
CREATE POLICY "Vendors can insert their own blocked times"
  ON public.vendor_blocked_times FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update their own blocked times"
  ON public.vendor_blocked_times FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can delete their own blocked times"
  ON public.vendor_blocked_times FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS vendor_blocked_times_set_updated_at ON public.vendor_blocked_times;
CREATE TRIGGER vendor_blocked_times_set_updated_at
  BEFORE UPDATE ON public.vendor_blocked_times
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_blocked_times()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.block_end <= NEW.block_start THEN
    RAISE EXCEPTION 'block_end must be after block_start';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_blocked_times_validate ON public.vendor_blocked_times;
CREATE TRIGGER vendor_blocked_times_validate
  BEFORE INSERT OR UPDATE ON public.vendor_blocked_times
  FOR EACH ROW EXECUTE FUNCTION public.validate_blocked_times();

-- ---------------------------------------------------------------------
-- 3. calendar_holds
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_holds (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id    uuid NOT NULL,
  customer_user_id  uuid,
  customer_email    text,
  package_id        text,
  booking_id        uuid,
  hold_start        timestamptz NOT NULL,
  hold_end          timestamptz NOT NULL,
  status            text NOT NULL DEFAULT 'active',
  source            text NOT NULL DEFAULT 'checkout',
  expires_at        timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_holds_vendor_active
  ON public.calendar_holds (vendor_user_id, hold_start, hold_end) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS calendar_holds_expiry
  ON public.calendar_holds (expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS calendar_holds_customer
  ON public.calendar_holds (customer_user_id);
CREATE INDEX IF NOT EXISTS calendar_holds_booking
  ON public.calendar_holds (booking_id);

ALTER TABLE public.calendar_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view their own holds"        ON public.calendar_holds;
DROP POLICY IF EXISTS "Vendors can view holds on their calendar"  ON public.calendar_holds;
DROP POLICY IF EXISTS "Customers can create holds for themselves" ON public.calendar_holds;
DROP POLICY IF EXISTS "Vendors can update holds on their calendar" ON public.calendar_holds;
DROP POLICY IF EXISTS "Customers can release their own holds"     ON public.calendar_holds;

CREATE POLICY "Customers can view their own holds"
  ON public.calendar_holds FOR SELECT USING (auth.uid() = customer_user_id);
CREATE POLICY "Vendors can view holds on their calendar"
  ON public.calendar_holds FOR SELECT USING (auth.uid() = vendor_user_id);
CREATE POLICY "Customers can create holds for themselves"
  ON public.calendar_holds FOR INSERT WITH CHECK (auth.uid() = customer_user_id OR customer_user_id IS NULL);
CREATE POLICY "Vendors can update holds on their calendar"
  ON public.calendar_holds FOR UPDATE USING (auth.uid() = vendor_user_id);
CREATE POLICY "Customers can release their own holds"
  ON public.calendar_holds FOR UPDATE USING (auth.uid() = customer_user_id);

DROP TRIGGER IF EXISTS calendar_holds_set_updated_at ON public.calendar_holds;
CREATE TRIGGER calendar_holds_set_updated_at
  BEFORE UPDATE ON public.calendar_holds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_calendar_hold()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.hold_end <= NEW.hold_start THEN
    RAISE EXCEPTION 'hold_end must be after hold_start';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.status = 'active' AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future for active holds';
  END IF;
  IF NEW.status NOT IN ('active','converted','released','expired') THEN
    RAISE EXCEPTION 'invalid hold status: %', NEW.status;
  END IF;
  IF NEW.source NOT IN ('checkout','vendor_approval','private_package') THEN
    RAISE EXCEPTION 'invalid hold source: %', NEW.source;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS calendar_holds_validate ON public.calendar_holds;
CREATE TRIGGER calendar_holds_validate
  BEFORE INSERT OR UPDATE ON public.calendar_holds
  FOR EACH ROW EXECUTE FUNCTION public.validate_calendar_hold();

-- ---------------------------------------------------------------------
-- 4. bookings — calendar block + lifecycle columns
-- ---------------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS event_start_at         timestamptz,
  ADD COLUMN IF NOT EXISTS event_end_at           timestamptz,
  ADD COLUMN IF NOT EXISTS calendar_block_start   timestamptz,
  ADD COLUMN IF NOT EXISTS calendar_block_end     timestamptz,
  ADD COLUMN IF NOT EXISTS event_timezone         text DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS confirmed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_deadline  timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at           timestamptz,
  ADD COLUMN IF NOT EXISTS lifecycle_status       text;

CREATE INDEX IF NOT EXISTS bookings_vendor_calendar_block
  ON public.bookings (vendor_user_id, calendar_block_start, calendar_block_end);
CREATE INDEX IF NOT EXISTS bookings_lifecycle_status
  ON public.bookings (lifecycle_status);

CREATE OR REPLACE FUNCTION public.validate_booking_calendar_block()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.calendar_block_start IS NOT NULL
     AND NEW.calendar_block_end IS NOT NULL
     AND NEW.calendar_block_end <= NEW.calendar_block_start THEN
    RAISE EXCEPTION 'calendar_block_end must be after calendar_block_start';
  END IF;
  IF NEW.event_start_at IS NOT NULL
     AND NEW.event_end_at IS NOT NULL
     AND NEW.event_end_at <= NEW.event_start_at THEN
    RAISE EXCEPTION 'event_end_at must be after event_start_at';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_validate_calendar_block ON public.bookings;
CREATE TRIGGER bookings_validate_calendar_block
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_calendar_block();

CREATE OR REPLACE FUNCTION public.sync_booking_lifecycle_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  paid boolean := (NEW.deposit_paid_at IS NOT NULL OR NEW.final_paid_at IS NOT NULL
                   OR NEW.payment_status IN ('paid','deposit_paid'));
BEGIN
  IF NEW.lifecycle_status IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.lifecycle_status IS DISTINCT FROM OLD.lifecycle_status) THEN
    RETURN NEW;
  END IF;

  NEW.lifecycle_status := CASE lower(coalesce(NEW.status,''))
    WHEN 'pending'           THEN 'pending_vendor_approval'
    WHEN 'awaiting_payment'  THEN 'approved_payment_required'
    WHEN 'approved'          THEN CASE WHEN paid THEN 'confirmed' ELSE 'approved_payment_required' END
    WHEN 'paid'              THEN 'confirmed'
    WHEN 'confirmed'         THEN 'confirmed'
    WHEN 'in_progress'       THEN 'in_progress'
    WHEN 'completed'         THEN 'completed'
    WHEN 'cancelled'         THEN 'cancelled_by_customer'
    WHEN 'canceled'          THEN 'cancelled_by_customer'
    WHEN 'declined'          THEN 'declined_by_vendor'
    WHEN 'expired'           THEN 'expired'
    WHEN 'no_show'           THEN 'no_show'
    WHEN 'refunded'          THEN 'refunded'
    ELSE coalesce(NEW.lifecycle_status, 'pending_vendor_approval')
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_sync_lifecycle_status ON public.bookings;
CREATE TRIGGER bookings_sync_lifecycle_status
  BEFORE INSERT OR UPDATE OF status, payment_status, deposit_paid_at, final_paid_at, lifecycle_status
  ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_booking_lifecycle_status();

-- ---------------------------------------------------------------------
-- 5. private_packages — calendar block columns
-- ---------------------------------------------------------------------
ALTER TABLE public.private_packages
  ADD COLUMN IF NOT EXISTS calendar_block_start timestamptz,
  ADD COLUMN IF NOT EXISTS calendar_block_end   timestamptz;

CREATE INDEX IF NOT EXISTS private_packages_vendor_calendar_block
  ON public.private_packages (vendor_user_id, calendar_block_start, calendar_block_end);

-- ---------------------------------------------------------------------
-- 6. vendor_buffer_settings — booking-rule defaults
-- ---------------------------------------------------------------------
ALTER TABLE public.vendor_buffer_settings
  ADD COLUMN IF NOT EXISTS minimum_notice_hours          integer NOT NULL DEFAULT 48,
  ADD COLUMN IF NOT EXISTS advance_booking_days          integer NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS vendor_approval_expires_hours integer NOT NULL DEFAULT 48;

-- ---------------------------------------------------------------------
-- 7. vendor_packages — package-level overrides
-- ---------------------------------------------------------------------
ALTER TABLE public.vendor_packages
  ADD COLUMN IF NOT EXISTS requires_vendor_approval  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_bookings_per_day      integer,
  ADD COLUMN IF NOT EXISTS available_days_override   integer[],
  ADD COLUMN IF NOT EXISTS available_window_override jsonb;

-- ---------------------------------------------------------------------
-- 8. Backfill: per-package weekly hours -> vendor master schedule
-- ---------------------------------------------------------------------
INSERT INTO public.vendor_weekly_availability (user_id, day_of_week, start_time, end_time, is_enabled)
SELECT DISTINCT pwa.user_id, pwa.day_of_week, pwa.start_time, pwa.end_time, pwa.is_enabled
FROM public.package_weekly_availability pwa
WHERE pwa.user_id IS NOT NULL
ON CONFLICT (user_id, day_of_week, start_time) DO NOTHING;

-- ---------------------------------------------------------------------
-- 9. Backfill: bookings event_*_at + calendar_block_* + lifecycle_status
-- ---------------------------------------------------------------------
UPDATE public.bookings b
SET
  event_start_at = CASE
    WHEN b.event_date IS NOT NULL AND b.start_time IS NOT NULL
      THEN ((b.event_date::text || ' ' || b.start_time::text)::timestamp AT TIME ZONE coalesce(b.event_timezone,'America/New_York'))
    ELSE b.event_start_at
  END,
  event_end_at = CASE
    WHEN b.event_date IS NOT NULL AND b.end_time IS NOT NULL
      THEN ((b.event_date::text || ' ' || b.end_time::text)::timestamp AT TIME ZONE coalesce(b.event_timezone,'America/New_York'))
    WHEN b.event_date IS NOT NULL AND b.start_time IS NOT NULL AND b.duration_minutes IS NOT NULL
      THEN ((b.event_date::text || ' ' || b.start_time::text)::timestamp AT TIME ZONE coalesce(b.event_timezone,'America/New_York'))
           + make_interval(mins => b.duration_minutes)
    ELSE b.event_end_at
  END
WHERE b.event_start_at IS NULL OR b.event_end_at IS NULL;

UPDATE public.bookings b
SET
  calendar_block_start = b.event_start_at - make_interval(mins => coalesce(b.setup_minutes, 0)),
  calendar_block_end   = b.event_end_at   + make_interval(mins => coalesce(b.breakdown_minutes, 0))
WHERE b.event_start_at IS NOT NULL
  AND b.event_end_at   IS NOT NULL
  AND (b.calendar_block_start IS NULL OR b.calendar_block_end IS NULL);

-- Re-trigger the lifecycle sync trigger to backfill lifecycle_status
UPDATE public.bookings SET status = status WHERE lifecycle_status IS NULL;