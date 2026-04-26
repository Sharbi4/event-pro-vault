-- Drop the prior role-scoped INSERT policies and replace with ones that
-- correctly cover both: signed-in users booking on their account, and
-- signed-in OR anonymous users booking as guests with an email.

DROP POLICY IF EXISTS "Authenticated users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Guests can create bookings with an email" ON public.bookings;

-- Authenticated users: may insert a row tied to themselves, OR a guest-style
-- row (no user_id) as long as they include a customer_email.
CREATE POLICY "Authenticated users can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  OR (user_id IS NULL AND customer_email IS NOT NULL)
);

-- Anonymous visitors: may only insert guest-style rows with an email.
CREATE POLICY "Guests can create bookings with an email"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL AND customer_email IS NOT NULL
);