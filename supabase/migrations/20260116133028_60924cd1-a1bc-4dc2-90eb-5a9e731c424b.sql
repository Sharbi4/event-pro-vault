-- Add new columns to vendor_packages for enhanced package features
ALTER TABLE public.vendor_packages 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS travel_radius INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS travel_fee_per_mile DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'flexible';

-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload package images
CREATE POLICY "Vendors can upload package images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'package-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to package images
CREATE POLICY "Package images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'package-images');

-- Allow vendors to update their own package images
CREATE POLICY "Vendors can update their package images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'package-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to delete their own package images
CREATE POLICY "Vendors can delete their package images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'package-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);