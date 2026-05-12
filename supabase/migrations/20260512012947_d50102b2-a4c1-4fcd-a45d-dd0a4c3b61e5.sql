
CREATE TABLE public.support_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text,
  reason text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'pending',
  delivery_error text,
  delivery_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_escalations_conv ON public.support_escalations(conversation_id, sent_at DESC);
CREATE INDEX idx_support_escalations_user ON public.support_escalations(user_id, sent_at DESC);

ALTER TABLE public.support_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all support escalations"
ON public.support_escalations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view their own support escalations"
ON public.support_escalations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
