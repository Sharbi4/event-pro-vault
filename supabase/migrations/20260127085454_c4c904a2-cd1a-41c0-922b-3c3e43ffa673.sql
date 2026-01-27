-- Create leads table for demand capture
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Event details
  category TEXT,
  event_type TEXT,
  event_start DATE,
  event_end DATE,
  event_time_start TIME,
  event_time_end TIME,
  
  -- Location
  city TEXT,
  state TEXT,
  zip TEXT,
  address TEXT,
  
  -- Budget
  budget_min NUMERIC,
  budget_max NUMERIC,
  
  -- Contact
  customer_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'no_matches',
  
  -- User reference (optional - for logged in users)
  user_id UUID,
  
  -- Tracking
  search_query JSONB,
  matched_at TIMESTAMP WITH TIME ZONE,
  matched_package_id UUID,
  
  CONSTRAINT leads_status_check CHECK (status IN ('new', 'notified', 'matched', 'closed')),
  CONSTRAINT leads_source_check CHECK (source IN ('no_matches', 'homepage', 'landing_page', 'package_page', 'header_cta'))
);

-- Create referral_invites table
CREATE TABLE public.referral_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  ref_code TEXT UNIQUE NOT NULL,
  created_by_user_id UUID,
  
  -- Optional targeting
  category TEXT,
  city TEXT,
  
  -- Tracking
  clicks INTEGER NOT NULL DEFAULT 0,
  signups INTEGER NOT NULL DEFAULT 0,
  
  -- Active status
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_invites ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

-- Referral policies
CREATE POLICY "Anyone can view active referral codes" ON public.referral_invites
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create referral invites" ON public.referral_invites
  FOR INSERT WITH CHECK (auth.uid() = created_by_user_id OR created_by_user_id IS NULL);

CREATE POLICY "Users can update their own referral invites" ON public.referral_invites
  FOR UPDATE USING (auth.uid() = created_by_user_id);

CREATE POLICY "Admins can view all referral invites" ON public.referral_invites
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_category_city ON public.leads(category, city);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_referral_invites_ref_code ON public.referral_invites(ref_code);

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();