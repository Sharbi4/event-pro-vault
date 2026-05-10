
-- Variations table
CREATE TABLE public.package_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  min_guests integer,
  max_guests integer,
  duration_minutes integer,
  includes text[] DEFAULT '{}'::text[],
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_package_variations_package_id ON public.package_variations(package_id);

ALTER TABLE public.package_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view package variations"
  ON public.package_variations FOR SELECT USING (true);

CREATE POLICY "Vendors insert their own variations"
  ON public.package_variations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors update their own variations"
  ON public.package_variations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Vendors delete their own variations"
  ON public.package_variations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_package_variations_updated_at
  BEFORE UPDATE ON public.package_variations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fulfillment options on vendor_packages
ALTER TABLE public.vendor_packages
  ADD COLUMN IF NOT EXISTS fulfillment_options text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS fulfillment_pricing jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Booking selections
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS selected_variation_id uuid,
  ADD COLUMN IF NOT EXISTS fulfillment_type text,
  ADD COLUMN IF NOT EXISTS selected_add_ons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS selected_menu_items jsonb NOT NULL DEFAULT '[]'::jsonb;
