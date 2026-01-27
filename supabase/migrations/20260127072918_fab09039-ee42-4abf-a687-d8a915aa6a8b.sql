-- Create disputes table for tracking customer issues with bookings
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reported_by_user_id UUID NOT NULL,
  vendor_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  description TEXT,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own disputes (as reporter or vendor)
CREATE POLICY "Users can view their own disputes"
ON public.disputes FOR SELECT
USING (auth.uid() = reported_by_user_id OR auth.uid() = vendor_user_id);

-- Policy: Users can create disputes for their own bookings
CREATE POLICY "Users can create disputes for their bookings"
ON public.disputes FOR INSERT
WITH CHECK (auth.uid() = reported_by_user_id);

-- Policy: Admins can view all disputes
CREATE POLICY "Admins can view all disputes"
ON public.disputes FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can update any dispute
CREATE POLICY "Admins can update disputes"
ON public.disputes FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_disputes_booking_id ON public.disputes(booking_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);

-- Add trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();