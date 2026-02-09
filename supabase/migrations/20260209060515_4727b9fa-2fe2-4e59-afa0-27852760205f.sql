-- Add is_featured column to vendor_packages for premium subscribers
ALTER TABLE public.vendor_packages 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add index for featured packages to optimize browse queries
CREATE INDEX IF NOT EXISTS idx_vendor_packages_featured 
ON public.vendor_packages (is_featured) 
WHERE is_featured = true;

-- Add premium subscription tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamp with time zone;