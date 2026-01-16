-- Create vendor_recurring_availability table for weekly patterns
CREATE TABLE public.vendor_recurring_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.vendor_recurring_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Vendors can view their own recurring availability"
ON public.vendor_recurring_availability FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own recurring availability"
ON public.vendor_recurring_availability FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own recurring availability"
ON public.vendor_recurring_availability FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own recurring availability"
ON public.vendor_recurring_availability FOR DELETE
USING (auth.uid() = user_id);

-- Public can view vendor recurring availability for booking purposes
CREATE POLICY "Public can view vendor recurring blocked days"
ON public.vendor_recurring_availability FOR SELECT
USING (is_blocked = true);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_recurring_availability_updated_at
BEFORE UPDATE ON public.vendor_recurring_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();