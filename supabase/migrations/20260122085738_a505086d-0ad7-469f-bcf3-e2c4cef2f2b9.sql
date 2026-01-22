-- Update profiles table to add first_name, last_name, phone
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS short_bio text,
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS primary_city text,
ADD COLUMN IF NOT EXISTS onboarding_step text DEFAULT 'profile-basics',
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Update vendor_details table for service area with lat/lng
ALTER TABLE public.vendor_details 
ADD COLUMN IF NOT EXISTS base_location_lat numeric,
ADD COLUMN IF NOT EXISTS base_location_lng numeric,
ADD COLUMN IF NOT EXISTS formatted_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS travel_radius_miles integer DEFAULT 25,
ADD COLUMN IF NOT EXISTS travel_fee_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_area_type text DEFAULT 'either',
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS media_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York';

-- Create vendor_weekly_availability table for weekly schedule
CREATE TABLE IF NOT EXISTS public.vendor_weekly_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_day_time UNIQUE (user_id, day_of_week, start_time)
);

-- Enable RLS on vendor_weekly_availability
ALTER TABLE public.vendor_weekly_availability ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_weekly_availability
CREATE POLICY "Vendors can view their own weekly availability" 
ON public.vendor_weekly_availability 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own weekly availability" 
ON public.vendor_weekly_availability 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own weekly availability" 
ON public.vendor_weekly_availability 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own weekly availability" 
ON public.vendor_weekly_availability 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view vendor weekly availability" 
ON public.vendor_weekly_availability 
FOR SELECT 
USING (true);

-- Update vendor_packages table for additional fields
ALTER TABLE public.vendor_packages 
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'hourly',
ADD COLUMN IF NOT EXISTS min_hours integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS min_spend numeric,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS setup_time_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS breakdown_time_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_requirements text,
ADD COLUMN IF NOT EXISTS included_travel_miles integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_mile numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create vendor_buffer_settings table
CREATE TABLE IF NOT EXISTS public.vendor_buffer_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  buffer_before_minutes integer NOT NULL DEFAULT 30,
  buffer_after_minutes integer NOT NULL DEFAULT 30,
  respect_setup_breakdown boolean NOT NULL DEFAULT true,
  available_by_request_only boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_buffer_settings
ALTER TABLE public.vendor_buffer_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_buffer_settings
CREATE POLICY "Vendors can view their own buffer settings" 
ON public.vendor_buffer_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own buffer settings" 
ON public.vendor_buffer_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own buffer settings" 
ON public.vendor_buffer_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view vendor buffer settings" 
ON public.vendor_buffer_settings 
FOR SELECT 
USING (true);

-- Trigger for updated_at on new tables
CREATE TRIGGER update_vendor_weekly_availability_updated_at
BEFORE UPDATE ON public.vendor_weekly_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_buffer_settings_updated_at
BEFORE UPDATE ON public.vendor_buffer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();