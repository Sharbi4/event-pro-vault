
-- 1) Drop overly permissive realtime.messages base policies (app uses postgres_changes, not Realtime Broadcast)
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send realtime" ON realtime.messages;

-- 2) Profiles: prevent anonymous access to sensitive columns (email, phone, stripe, identity session)
REVOKE SELECT (email, phone, stripe_account_id, identity_verification_session_id) ON public.profiles FROM anon;

-- 3) vendor_achievements: remove self-insert; only service_role may write
DROP POLICY IF EXISTS "Vendors insert their achievements" ON public.vendor_achievements;

-- 4) vendor_challenges: remove ALL self-mutation policy; keep SELECT only
DROP POLICY IF EXISTS "Vendors manage their challenges" ON public.vendor_challenges;

-- 5) Add search_path to email queue helper functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
