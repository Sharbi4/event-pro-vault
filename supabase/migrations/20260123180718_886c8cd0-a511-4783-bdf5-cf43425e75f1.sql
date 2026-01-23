-- Add email column to profiles for caching user email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable realtime on bookings table for live availability updates
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;