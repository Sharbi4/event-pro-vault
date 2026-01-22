-- Add new pricing fields to vendor_packages
ALTER TABLE public.vendor_packages 
ADD COLUMN IF NOT EXISTS starting_at numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_hours integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS min_guests integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_quantity integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS overtime_rate numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deposit numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS additional_fees jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS max_travel_miles integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS included_miles integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee_per_mile numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pickup_only boolean DEFAULT false;

-- Update pricing_type column to support new types
-- Current values: 'hourly', 'daily', 'HOURLY', 'DAILY'
-- New values: 'hourly', 'daily', 'flat', 'per_guest', 'per_item', 'custom_quote'
COMMENT ON COLUMN public.vendor_packages.pricing_type IS 'Pricing type: hourly, daily, flat, per_guest, per_item, custom_quote';