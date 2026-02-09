-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Public can view active vendor packages" ON public.vendor_packages;

-- Create new policy without Stripe requirement
CREATE POLICY "Public can view active vendor packages" 
ON public.vendor_packages 
FOR SELECT 
USING (
  (is_active = true) AND 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = vendor_packages.user_id 
    AND profiles.is_vendor = true
  ))
);