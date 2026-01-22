-- Enforce one market per user (MVP constraint)
CREATE UNIQUE INDEX IF NOT EXISTS unique_market_per_user ON markets (user_id);

-- Add booking_mode column to markets for instant vs request approval
ALTER TABLE markets ADD COLUMN IF NOT EXISTS booking_mode text DEFAULT 'instant';

-- Add market_status column for draft/published workflow
ALTER TABLE markets ADD COLUMN IF NOT EXISTS market_status text DEFAULT 'draft';