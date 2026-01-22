-- Create package-level availability table for specific blocked dates
CREATE TABLE public.package_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.vendor_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, date)
);

-- Create package-level weekly availability table
CREATE TABLE public.package_weekly_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.vendor_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.package_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_weekly_availability ENABLE ROW LEVEL SECURITY;

-- Package availability policies
CREATE POLICY "Vendors can view their own package availability"
  ON public.package_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own package availability"
  ON public.package_availability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own package availability"
  ON public.package_availability FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own package availability"
  ON public.package_availability FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view package blocked dates"
  ON public.package_availability FOR SELECT
  USING (is_blocked = true);

-- Package weekly availability policies
CREATE POLICY "Vendors can view their own package weekly availability"
  ON public.package_weekly_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own package weekly availability"
  ON public.package_weekly_availability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own package weekly availability"
  ON public.package_weekly_availability FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own package weekly availability"
  ON public.package_weekly_availability FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view package weekly availability"
  ON public.package_weekly_availability FOR SELECT
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_package_availability_updated_at
  BEFORE UPDATE ON public.package_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_weekly_availability_updated_at
  BEFORE UPDATE ON public.package_weekly_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();