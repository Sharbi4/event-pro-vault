-- Identity verification event timeline
CREATE TABLE public.identity_verification_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  status TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_identity_verification_events_user_id_created
  ON public.identity_verification_events (user_id, created_at DESC);

ALTER TABLE public.identity_verification_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own identity verification events"
ON public.identity_verification_events
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all identity verification events"
ON public.identity_verification_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only service role / webhook writes events (no client INSERT/UPDATE/DELETE policies)
