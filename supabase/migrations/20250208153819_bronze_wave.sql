-- Add email preferences to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;

-- Add index for email verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
ON profiles(email_verified);

-- Add constraint to ensure valid email format
ALTER TABLE profiles
ADD CONSTRAINT email_format CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);