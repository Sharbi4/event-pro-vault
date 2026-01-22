-- Add payment method preferences to vendor_details
ALTER TABLE public.vendor_details 
ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT ARRAY['stripe']::text[],
ADD COLUMN IF NOT EXISTS accepts_cash boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_stripe boolean DEFAULT true;