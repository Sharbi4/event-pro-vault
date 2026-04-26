
-- ============= SHARE KIT =============
CREATE TABLE public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  package_id uuid,
  code text NOT NULL UNIQUE,
  channel text,
  is_active boolean NOT NULL DEFAULT true,
  click_count integer NOT NULL DEFAULT 0,
  signup_count integer NOT NULL DEFAULT 0,
  booking_count integer NOT NULL DEFAULT 0,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_share_links_vendor ON public.share_links(vendor_user_id);
CREATE INDEX idx_share_links_code ON public.share_links(code);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active share links"
  ON public.share_links FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors view their share links"
  ON public.share_links FOR SELECT USING (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors insert their share links"
  ON public.share_links FOR INSERT WITH CHECK (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors update their share links"
  ON public.share_links FOR UPDATE USING (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors delete their share links"
  ON public.share_links FOR DELETE USING (auth.uid() = vendor_user_id);

CREATE TABLE public.share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE CASCADE,
  vendor_user_id uuid NOT NULL,
  event_type text NOT NULL, -- 'share' | 'click' | 'signup' | 'booking'
  channel text,
  referrer text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_share_events_vendor ON public.share_events(vendor_user_id);
CREATE INDEX idx_share_events_link ON public.share_events(share_link_id);

ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert share events"
  ON public.share_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors view their share events"
  ON public.share_events FOR SELECT USING (auth.uid() = vendor_user_id);

CREATE TABLE public.share_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE SET NULL,
  recipient_email text,
  recipient_phone text,
  recipient_name text,
  channel text NOT NULL, -- 'email' | 'sms'
  message text,
  status text NOT NULL DEFAULT 'sent', -- 'sent' | 'opened' | 'clicked' | 'converted' | 'failed'
  sent_at timestamptz NOT NULL DEFAULT now(),
  opened_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_share_invites_vendor ON public.share_invites(vendor_user_id);

ALTER TABLE public.share_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors view their invites"
  ON public.share_invites FOR SELECT USING (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors create their invites"
  ON public.share_invites FOR INSERT WITH CHECK (auth.uid() = vendor_user_id);

-- ============= GAMIFICATION =============
CREATE TABLE public.vendor_points (
  vendor_user_id uuid PRIMARY KEY,
  total_points integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze', -- bronze | silver | gold | platinum
  current_streak_days integer NOT NULL DEFAULT 0,
  longest_streak_days integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  multiplier numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view vendor points (leaderboard)"
  ON public.vendor_points FOR SELECT USING (true);
CREATE POLICY "Vendors manage their points"
  ON public.vendor_points FOR ALL USING (auth.uid() = vendor_user_id) WITH CHECK (auth.uid() = vendor_user_id);

CREATE TABLE public.vendor_point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  action text NOT NULL, -- 'share', 'signup_referral', 'booking_referral', 'review_received', 'challenge_complete', 'streak_bonus'
  points integer NOT NULL,
  description text,
  related_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_point_events_vendor ON public.vendor_point_events(vendor_user_id, created_at DESC);

ALTER TABLE public.vendor_point_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors view their point events"
  ON public.vendor_point_events FOR SELECT USING (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors insert their point events"
  ON public.vendor_point_events FOR INSERT WITH CHECK (auth.uid() = vendor_user_id);

CREATE TABLE public.vendor_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  challenge_key text NOT NULL, -- e.g. 'share_3_packages_week'
  title text NOT NULL,
  description text,
  goal integer NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  reward_points integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_challenges_vendor ON public.vendor_challenges(vendor_user_id, ends_at DESC);

ALTER TABLE public.vendor_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors view their challenges"
  ON public.vendor_challenges FOR SELECT USING (auth.uid() = vendor_user_id);
CREATE POLICY "Vendors manage their challenges"
  ON public.vendor_challenges FOR ALL USING (auth.uid() = vendor_user_id) WITH CHECK (auth.uid() = vendor_user_id);

CREATE TABLE public.vendor_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id uuid NOT NULL,
  achievement_key text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vendor_user_id, achievement_key)
);
CREATE INDEX idx_achievements_vendor ON public.vendor_achievements(vendor_user_id);

ALTER TABLE public.vendor_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view achievements (badges on profile)"
  ON public.vendor_achievements FOR SELECT USING (true);
CREATE POLICY "Vendors insert their achievements"
  ON public.vendor_achievements FOR INSERT WITH CHECK (auth.uid() = vendor_user_id);

-- featured_until on packages
ALTER TABLE public.vendor_packages ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- timestamp triggers
CREATE TRIGGER update_share_links_updated_at BEFORE UPDATE ON public.share_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_points_updated_at BEFORE UPDATE ON public.vendor_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_challenges_updated_at BEFORE UPDATE ON public.vendor_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
