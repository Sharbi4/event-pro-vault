
-- Drop the restrictive vendor_details public SELECT policy
DROP POLICY IF EXISTS "Public can view vendor details for listing" ON public.vendor_details;

-- Recreate without Stripe requirement - just needs is_vendor = true
CREATE POLICY "Public can view vendor details for listing"
ON public.vendor_details
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = vendor_details.user_id
      AND profiles.is_vendor = true
  )
);
