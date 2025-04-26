-- Add address column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address text;

-- Update existing policies to include address
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_address
ON profiles(address);