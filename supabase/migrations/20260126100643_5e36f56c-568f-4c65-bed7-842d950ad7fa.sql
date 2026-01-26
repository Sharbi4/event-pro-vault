-- Add username column for public profile URLs
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for faster lookups by username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add a check constraint for valid username format (lowercase, alphanumeric, hyphens, 3-30 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$' AND
    username !~ '--'
  )
);