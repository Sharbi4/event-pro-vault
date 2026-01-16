-- Create vendor_packages table for listings management
CREATE TABLE public.vendor_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'HOURLY' CHECK (type IN ('HOURLY', 'DAILY')),
  price DECIMAL(10,2) NOT NULL,
  min_units INTEGER NOT NULL DEFAULT 1,
  includes TEXT[] DEFAULT '{}',
  add_ons JSONB DEFAULT '[]',
  requirements TEXT[] DEFAULT '{}',
  instant_book BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_packages ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own packages
CREATE POLICY "Vendors can view their own packages"
ON public.vendor_packages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can create their own packages"
ON public.vendor_packages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own packages"
ON public.vendor_packages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can delete their own packages"
ON public.vendor_packages FOR DELETE
USING (auth.uid() = user_id);

-- Public can view active packages from active vendors
CREATE POLICY "Public can view active vendor packages"
ON public.vendor_packages FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = vendor_packages.user_id 
    AND profiles.is_vendor = true 
    AND profiles.stripe_account_status = 'active'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_vendor_packages_updated_at
BEFORE UPDATE ON public.vendor_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add vendor_user_id to bookings to track which vendor received the booking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vendor_user_id UUID REFERENCES auth.users(id);

-- Create policy for vendors to view bookings they received
CREATE POLICY "Vendors can view bookings for their services"
ON public.bookings FOR SELECT
USING (auth.uid() = vendor_user_id);

-- Create policy for vendors to update bookings (accept/decline)
CREATE POLICY "Vendors can update bookings for their services"
ON public.bookings FOR UPDATE
USING (auth.uid() = vendor_user_id);