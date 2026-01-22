-- Add profile_type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT NULL;

-- Create markets table
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  market_type TEXT NOT NULL,
  description TEXT,
  crowd_description TEXT,
  categories_allowed TEXT[] DEFAULT '{}',
  operating_season TEXT DEFAULT 'year-round',
  seasonal_months TEXT[] DEFAULT '{}',
  
  -- Location
  formatted_address TEXT,
  city TEXT,
  state TEXT,
  lat NUMERIC,
  lng NUMERIC,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Schedule
  weekly_schedule JSONB DEFAULT '[]',
  setup_window_minutes INTEGER DEFAULT 60,
  breakdown_window_minutes INTEGER DEFAULT 30,
  
  -- Media
  media_items JSONB DEFAULT '[]',
  cover_image_url TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  bookings_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on markets
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Markets RLS policies
CREATE POLICY "Users can view their own markets"
ON public.markets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own markets"
ON public.markets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own markets"
ON public.markets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own markets"
ON public.markets FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published markets"
ON public.markets FOR SELECT
USING (is_published = true);

-- Create slot_types table
CREATE TABLE public.slot_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  width_feet INTEGER,
  length_feet INTEGER,
  size_preset TEXT,
  price NUMERIC NOT NULL,
  pricing_unit TEXT NOT NULL DEFAULT 'per_day',
  amenities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on slot_types
ALTER TABLE public.slot_types ENABLE ROW LEVEL SECURITY;

-- Slot types RLS policies
CREATE POLICY "Users can view their own slot types"
ON public.slot_types FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slot types"
ON public.slot_types FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slot types"
ON public.slot_types FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slot types"
ON public.slot_types FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active slot types for published markets"
ON public.slot_types FOR SELECT
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.markets 
    WHERE markets.id = slot_types.market_id 
    AND markets.is_published = true
  )
);

-- Create slot_inventory table
CREATE TABLE public.slot_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  slot_type_id UUID NOT NULL REFERENCES public.slot_types(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 1,
  slots_remaining INTEGER NOT NULL DEFAULT 1,
  price_override NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slot_type_id, date, start_time)
);

-- Enable RLS on slot_inventory
ALTER TABLE public.slot_inventory ENABLE ROW LEVEL SECURITY;

-- Slot inventory RLS policies
CREATE POLICY "Users can view their own slot inventory"
ON public.slot_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slot inventory"
ON public.slot_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slot inventory"
ON public.slot_inventory FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own slot inventory"
ON public.slot_inventory FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view slot inventory for published markets"
ON public.slot_inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.markets 
    WHERE markets.id = slot_inventory.market_id 
    AND markets.is_published = true
  )
);

-- Create slot_bookings table
CREATE TABLE public.slot_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_inventory_id UUID NOT NULL REFERENCES public.slot_inventory(id) ON DELETE CASCADE,
  slot_type_id UUID NOT NULL REFERENCES public.slot_types(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vendor_user_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'stripe',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  vendor_name TEXT,
  vendor_email TEXT,
  vendor_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on slot_bookings
ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;

-- Slot bookings RLS policies
CREATE POLICY "Users can view their own slot bookings"
ON public.slot_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slot bookings"
ON public.slot_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slot bookings"
ON public.slot_bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Market owners can view bookings for their markets"
ON public.slot_bookings FOR SELECT
USING (auth.uid() = vendor_user_id);

CREATE POLICY "Market owners can update bookings for their markets"
ON public.slot_bookings FOR UPDATE
USING (auth.uid() = vendor_user_id);

-- Add updated_at triggers
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON public.markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slot_types_updated_at
BEFORE UPDATE ON public.slot_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slot_inventory_updated_at
BEFORE UPDATE ON public.slot_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slot_bookings_updated_at
BEFORE UPDATE ON public.slot_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();