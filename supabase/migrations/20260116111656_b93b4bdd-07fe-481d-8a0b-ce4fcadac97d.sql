-- Create vendor_availability table for blackout dates
CREATE TABLE public.vendor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Vendors can view their own availability"
ON public.vendor_availability FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own availability"
ON public.vendor_availability FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own availability"
ON public.vendor_availability FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own availability"
ON public.vendor_availability FOR DELETE
USING (auth.uid() = user_id);

-- Public can view vendor blocked dates for booking purposes
CREATE POLICY "Public can view vendor blocked dates"
ON public.vendor_availability FOR SELECT
USING (is_blocked = true);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_availability_updated_at
BEFORE UPDATE ON public.vendor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();