-- Create reviews table for vendor ratings
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_user_id UUID NOT NULL,
  package_id UUID REFERENCES public.vendor_packages(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reviewer_user_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  event_type TEXT,
  event_date DATE,
  is_verified_booking BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can view all reviews
CREATE POLICY "Public can view all reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Users can create reviews for bookings they made
CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster vendor lookups
CREATE INDEX idx_reviews_vendor_user_id ON public.reviews(vendor_user_id);
CREATE INDEX idx_reviews_package_id ON public.reviews(package_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);