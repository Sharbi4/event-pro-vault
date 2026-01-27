-- Create dispute-evidence storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('dispute-evidence', 'dispute-evidence', false);

-- Storage policies for dispute-evidence bucket
CREATE POLICY "Users can upload their own dispute evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dispute-evidence' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own dispute evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dispute-evidence' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all dispute evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dispute-evidence' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Vendors can view dispute evidence for their disputes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dispute-evidence' 
  AND EXISTS (
    SELECT 1 FROM disputes d
    WHERE d.vendor_user_id = auth.uid()
    AND (storage.foldername(name))[2] = d.id::text
  )
);

-- Expand disputes table with full dispute resolution fields
ALTER TABLE public.disputes
ADD COLUMN filed_by_type text NOT NULL DEFAULT 'customer',
ADD COLUMN evidence_urls text[] DEFAULT '{}',
ADD COLUMN requested_remedy text,
ADD COLUMN requested_remedy_details text,
ADD COLUMN vendor_response text,
ADD COLUMN vendor_response_deadline timestamptz,
ADD COLUMN vendor_responded_at timestamptz,
ADD COLUMN vendor_proposed_remedy text,
ADD COLUMN mediation_started_at timestamptz,
ADD COLUMN resolution_deadline timestamptz,
ADD COLUMN resolution_outcome text,
ADD COLUMN resolution_notes text,
ADD COLUMN deposit_refund_ordered boolean DEFAULT false,
ADD COLUMN payout_held boolean DEFAULT true;

-- Add constraint for filed_by_type
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_filed_by_type_check 
CHECK (filed_by_type IN ('customer', 'vendor'));

-- Add constraint for requested_remedy
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_requested_remedy_check 
CHECK (requested_remedy IS NULL OR requested_remedy IN ('full_refund', 'partial_refund', 'credit', 'reschedule', 'other'));

-- Add constraint for resolution_outcome
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_resolution_outcome_check 
CHECK (resolution_outcome IS NULL OR resolution_outcome IN ('full_refund', 'partial_refund', 'vendor_paid', 'credit', 'reschedule', 'denied', 'withdrawn'));

-- Add constraint for status
ALTER TABLE public.disputes
DROP CONSTRAINT IF EXISTS disputes_status_check;
ALTER TABLE public.disputes
ADD CONSTRAINT disputes_status_check 
CHECK (status IN ('pending', 'vendor_response', 'mediation', 'resolved', 'closed', 'withdrawn'));

-- Create function to auto-set vendor response deadline (48 hours from creation)
CREATE OR REPLACE FUNCTION public.set_dispute_deadlines()
RETURNS TRIGGER AS $$
BEGIN
  -- Set vendor response deadline to 48 hours from now
  NEW.vendor_response_deadline := NOW() + INTERVAL '48 hours';
  -- Set resolution deadline to 7 days from now
  NEW.resolution_deadline := NOW() + INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_dispute_deadlines_trigger
BEFORE INSERT ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.set_dispute_deadlines();

-- Update RLS policy to allow vendors to update their response
DROP POLICY IF EXISTS "Vendors can respond to disputes" ON public.disputes;
CREATE POLICY "Vendors can respond to disputes"
ON public.disputes FOR UPDATE
USING (auth.uid() = vendor_user_id)
WITH CHECK (auth.uid() = vendor_user_id);

-- Allow customers to update their own disputes (e.g., withdraw)
DROP POLICY IF EXISTS "Customers can update their disputes" ON public.disputes;
CREATE POLICY "Customers can update their disputes"
ON public.disputes FOR UPDATE
USING (auth.uid() = reported_by_user_id)
WITH CHECK (auth.uid() = reported_by_user_id);

-- Enable realtime for disputes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;