
-- 1) Tighten calendar_holds: require authenticated insert tied to the customer
DROP POLICY IF EXISTS "Customers can create holds for themselves" ON public.calendar_holds;
CREATE POLICY "Customers can create holds for themselves"
  ON public.calendar_holds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_user_id);

-- 2) Lock down vendor_points / vendor_point_events to service role
DROP POLICY IF EXISTS "Vendors manage their points" ON public.vendor_points;
CREATE POLICY "Vendors can view their points"
  ON public.vendor_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = vendor_user_id);

DROP POLICY IF EXISTS "Vendors insert their point events" ON public.vendor_point_events;
-- (SELECT policy on vendor_point_events remains for vendors to view their own events)
