
-- 1. Lock down payment_reminders to service role only
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.payment_reminders;

CREATE POLICY "Service role manages payment reminders"
ON public.payment_reminders
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access payment reminders"
ON public.payment_reminders
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. Hide email and phone columns on profiles from anonymous role.
--    Authenticated users (including owners) and service_role retain access.
REVOKE SELECT (email, phone) ON public.profiles FROM anon;

-- 3. Require authenticated subscribers on realtime.messages (broadcast/presence).
--    postgres_changes events remain RLS-filtered by source tables.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can send realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can send realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
