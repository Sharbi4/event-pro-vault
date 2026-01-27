-- Create analytics_events table for funnel + attribution tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  city TEXT,
  state TEXT,
  category TEXT,
  package_id UUID,
  pro_id UUID,
  lead_id UUID,
  referral_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_category_city ON public.analytics_events(category, city);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon or authenticated) to insert analytics events
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics events
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete analytics events (for cleanup)
CREATE POLICY "Admins can delete analytics events"
  ON public.analytics_events
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));