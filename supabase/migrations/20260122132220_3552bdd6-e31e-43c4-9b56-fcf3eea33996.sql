-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin identification
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add approval_status to profiles (for event pros)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approval_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Add approval_status to markets
ALTER TABLE public.markets
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approval_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Update public visibility policy for profiles to include approval check
DROP POLICY IF EXISTS "Public can view vendor profiles" ON public.profiles;
CREATE POLICY "Public can view approved vendor profiles"
ON public.profiles
FOR SELECT
USING (
  (is_vendor = true AND stripe_account_status = 'active' AND approval_status = 'approved')
  OR (auth.uid() = user_id)
);

-- Update public visibility policy for markets to include approval check
DROP POLICY IF EXISTS "Public can view published markets" ON public.markets;
CREATE POLICY "Public can view approved published markets"
ON public.markets
FOR SELECT
USING (
  (is_published = true AND approval_status = 'approved')
  OR (auth.uid() = user_id)
);

-- Allow admins to view all profiles for review
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for approval)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all markets for review
CREATE POLICY "Admins can view all markets"
ON public.markets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any market (for approval)
CREATE POLICY "Admins can update any market"
ON public.markets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to get current user's roles
CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;