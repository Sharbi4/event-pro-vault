-- Add max_guests and max_items columns to vendor_packages
ALTER TABLE public.vendor_packages 
ADD COLUMN IF NOT EXISTS max_guests integer,
ADD COLUMN IF NOT EXISTS max_items integer;