-- Replace the combined INSERT policy on bookings with two clearer role-scoped policies
DROP POLICY IF EXISTS "Users and guests can create bookings" ON public.bookings;

-- Authenticated users may insert bookings tied to their own user_id
CREATE POLICY "Authenticated users can create their own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Guests (anon role) may insert bookings only with a customer_email and no user_id
CREATE POLICY "Guests can create bookings with an email"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND customer_email IS NOT NULL);