CREATE TABLE public.support_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID,
  request_id TEXT,
  user_message_masked TEXT,
  assistant_reply_masked TEXT,
  history_length INT,
  model TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  latency_ms INT,
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,
  status TEXT NOT NULL DEFAULT 'ok',
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_chat_logs_conversation ON public.support_chat_logs(conversation_id, created_at DESC);
CREATE INDEX idx_support_chat_logs_user ON public.support_chat_logs(user_id, created_at DESC);
CREATE INDEX idx_support_chat_logs_status ON public.support_chat_logs(status, created_at DESC);

ALTER TABLE public.support_chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all support chat logs"
ON public.support_chat_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own support chat logs"
ON public.support_chat_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);