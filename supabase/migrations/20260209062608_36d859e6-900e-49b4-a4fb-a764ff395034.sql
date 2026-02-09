-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create bookings with email" ON public.bookings;

-- Create a more permissive INSERT policy that allows:
-- 1. Authenticated users to create bookings with their user_id
-- 2. Guest checkouts where user_id is null but customer_email is provided
-- 3. Service role to create bookings (for edge functions)
CREATE POLICY "Users and guests can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  -- Authenticated user creating their own booking
  (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  -- Or guest checkout with email
  OR (user_id IS NULL AND customer_email IS NOT NULL)
);