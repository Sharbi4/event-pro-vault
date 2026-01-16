-- Add vendor verification and Stripe Connect fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_vendor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS identity_verification_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS identity_verification_session_id text,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- Create vendor_details table for vendor-specific info
CREATE TABLE public.vendor_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  business_type text,
  business_description text,
  service_categories text[] DEFAULT '{}',
  service_area text,
  website_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_details
ALTER TABLE public.vendor_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_details
CREATE POLICY "Users can view their own vendor details"
ON public.vendor_details
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendor details"
ON public.vendor_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor details"
ON public.vendor_details
FOR UPDATE
USING (auth.uid() = user_id);

-- Public can view vendor details for active vendors (for profile pages)
CREATE POLICY "Public can view vendor details for listing"
ON public.vendor_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = vendor_details.user_id 
    AND profiles.is_vendor = true 
    AND profiles.stripe_account_status = 'active'
  )
);

-- Update profiles RLS to allow public viewing of vendor profiles
CREATE POLICY "Public can view vendor profiles"
ON public.profiles
FOR SELECT
USING (is_vendor = true AND stripe_account_status = 'active');

-- Trigger for updated_at on vendor_details
CREATE TRIGGER update_vendor_details_updated_at
BEFORE UPDATE ON public.vendor_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();