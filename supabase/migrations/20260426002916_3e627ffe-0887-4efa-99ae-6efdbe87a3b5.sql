-- 1. Private packages table
CREATE TABLE IF NOT EXISTS public.private_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  customer_user_id uuid,
  customer_email text,
  conversation_id uuid,
  booking_id uuid,

  package_name text NOT NULL,
  description text,
  category text,

  event_date date,
  start_time time,
  end_time time,
  location text,
  address_line1 text,
  address_line2 text,
  event_city text,
  event_state text,
  event_zip text,

  guest_count integer,
  included_items text[] DEFAULT '{}'::text[],
  menu_details text,
  service_duration_minutes integer DEFAULT 60,
  setup_time_minutes integer DEFAULT 0,
  breakdown_time_minutes integer DEFAULT 0,

  base_price numeric NOT NULL DEFAULT 0,
  per_person_price numeric DEFAULT 0,
  add_ons jsonb DEFAULT '[]'::jsonb,
  travel_fee numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,

  offer_expires_at timestamptz,
  cancellation_policy text DEFAULT 'standard',

  vendor_notes text,
  customer_notes text,

  status text NOT NULL DEFAULT 'draft',

  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT private_packages_status_check
    CHECK (status IN ('draft','sent','viewed','accepted','paid','booked','expired','cancelled'))
);

CREATE INDEX IF NOT EXISTS private_packages_vendor_idx
  ON public.private_packages(vendor_user_id, status);
CREATE INDEX IF NOT EXISTS private_packages_customer_idx
  ON public.private_packages(customer_user_id, status);
CREATE INDEX IF NOT EXISTS private_packages_conversation_idx
  ON public.private_packages(conversation_id);

ALTER TABLE public.private_packages ENABLE ROW LEVEL SECURITY;

-- Vendors: full access to their own packages
CREATE POLICY "Vendors can view their own private packages"
  ON public.private_packages FOR SELECT
  USING (auth.uid() = vendor_user_id);

CREATE POLICY "Vendors can create their own private packages"
  ON public.private_packages FOR INSERT
  WITH CHECK (auth.uid() = vendor_user_id);

CREATE POLICY "Vendors can update their own private packages"
  ON public.private_packages FOR UPDATE
  USING (auth.uid() = vendor_user_id);

CREATE POLICY "Vendors can delete their own private packages"
  ON public.private_packages FOR DELETE
  USING (auth.uid() = vendor_user_id AND status IN ('draft','cancelled','expired'));

-- Customers: see only what was sent to them
CREATE POLICY "Customers can view sent private packages"
  ON public.private_packages FOR SELECT
  USING (
    auth.uid() = customer_user_id
    AND status IN ('sent','viewed','accepted','paid','booked','expired','cancelled')
  );

CREATE POLICY "Customers can update private packages sent to them"
  ON public.private_packages FOR UPDATE
  USING (
    auth.uid() = customer_user_id
    AND status IN ('sent','viewed','accepted')
  );

-- updated_at trigger
CREATE TRIGGER private_packages_set_updated_at
  BEFORE UPDATE ON public.private_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. booking_type on bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_type text NOT NULL DEFAULT 'catering';

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN ('pull_up','catering','private_package'));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS private_package_id uuid;

CREATE INDEX IF NOT EXISTS bookings_private_package_idx
  ON public.bookings(private_package_id);

-- 3. Attach private packages to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attached_private_package_id uuid;

CREATE INDEX IF NOT EXISTS messages_attached_private_package_idx
  ON public.messages(attached_private_package_id);