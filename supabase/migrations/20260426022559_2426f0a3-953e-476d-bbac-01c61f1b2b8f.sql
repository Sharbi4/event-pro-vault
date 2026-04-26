ALTER TABLE public.vendor_packages
  ADD COLUMN IF NOT EXISTS package_kind text,
  ADD COLUMN IF NOT EXISTS pull_up_pricing_model text,
  ADD COLUMN IF NOT EXISTS catering_pricing_model text,
  ADD COLUMN IF NOT EXISTS min_guarantee_amount integer,
  ADD COLUMN IF NOT EXISTS included_guests integer,
  ADD COLUMN IF NOT EXISTS additional_per_person integer,
  ADD COLUMN IF NOT EXISTS max_guests integer,
  ADD COLUMN IF NOT EXISTS cuisine_styles text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS best_for text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS dietary_options text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS customer_questions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS setup_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cleanup_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_before_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_after_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS minimum_notice_hours integer,
  ADD COLUMN IF NOT EXISTS balance_due_timing text,
  ADD COLUMN IF NOT EXISTS menu_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Backfill status for existing rows from is_active where applicable
UPDATE public.vendor_packages
SET status = CASE WHEN is_active THEN 'published' ELSE 'draft' END
WHERE status = 'draft' AND created_at < now();

-- Validation trigger for status / pricing-model values (avoids brittle CHECK constraints)
CREATE OR REPLACE FUNCTION public.validate_vendor_package_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('draft','published','paused','archived') THEN
    RAISE EXCEPTION 'invalid status: %', NEW.status;
  END IF;
  IF NEW.package_kind IS NOT NULL AND NEW.package_kind NOT IN ('pull_up','catering') THEN
    RAISE EXCEPTION 'invalid package_kind: %', NEW.package_kind;
  END IF;
  IF NEW.pull_up_pricing_model IS NOT NULL AND NEW.pull_up_pricing_model NOT IN
    ('show_up_fee','min_guarantee','show_up_plus_min','no_upfront') THEN
    RAISE EXCEPTION 'invalid pull_up_pricing_model: %', NEW.pull_up_pricing_model;
  END IF;
  IF NEW.catering_pricing_model IS NOT NULL AND NEW.catering_pricing_model NOT IN
    ('flat','per_person','base_plus_per_person') THEN
    RAISE EXCEPTION 'invalid catering_pricing_model: %', NEW.catering_pricing_model;
  END IF;
  IF NEW.balance_due_timing IS NOT NULL AND NEW.balance_due_timing NOT IN
    ('before_event','day_of_event','after_event','direct_to_vendor') THEN
    RAISE EXCEPTION 'invalid balance_due_timing: %', NEW.balance_due_timing;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_vendor_package_fields_trg ON public.vendor_packages;
CREATE TRIGGER validate_vendor_package_fields_trg
BEFORE INSERT OR UPDATE ON public.vendor_packages
FOR EACH ROW EXECUTE FUNCTION public.validate_vendor_package_fields();