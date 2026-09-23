-- Add dealer status enum and column
-- This migration adds proper dealer status tracking for verification workflow

-- Create dealer_status enum
CREATE TYPE dealer_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- Add dealer_status column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dealer_status dealer_status DEFAULT 'PENDING';

-- Add rejection_reason column for rejected dealers
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add verified_at column to track when dealer was verified
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add suspended_at column to track when dealer was suspended
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Create index for dealer_status
CREATE INDEX IF NOT EXISTS idx_profiles_dealer_status ON profiles(dealer_status);

-- Migrate existing data:
-- - Existing active dealers (is_active = true) should become VERIFIED
-- - Existing inactive dealers (is_active = false) should become SUSPENDED
UPDATE profiles
SET 
  dealer_status = CASE 
    WHEN is_active = true THEN 'VERIFIED'
    ELSE 'SUSPENDED'
  END,
  verified_at = CASE 
    WHEN is_active = true THEN created_at
    ELSE NULL
  END,
  suspended_at = CASE 
    WHEN is_active = false THEN created_at
    ELSE NULL
  END
WHERE role = 'DEALER' AND dealer_status IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.dealer_status IS 'Dealer verification status: PENDING (awaiting verification), VERIFIED (approved), REJECTED (registration rejected), SUSPENDED (temporarily suspended)';
COMMENT ON COLUMN profiles.rejection_reason IS 'Reason for dealer rejection';
COMMENT ON COLUMN profiles.verified_at IS 'Timestamp when dealer was verified';
COMMENT ON COLUMN profiles.suspended_at IS 'Timestamp when dealer was suspended';
