/*
  # Fix Engineer Profile Relationship
  
  1. Changes
    - Add proper foreign key constraint from engineers to profiles
    - Update existing policies to use proper joins
    - Add indexes for better performance
*/

-- Drop existing foreign key if it exists
ALTER TABLE engineers 
DROP CONSTRAINT IF EXISTS engineers_user_id_fkey;

-- Add proper foreign key to profiles
ALTER TABLE engineers
ADD CONSTRAINT engineers_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_engineers_user_id 
ON engineers(user_id);

-- Update policies to use proper joins
DROP POLICY IF EXISTS "Engineers can view their data" ON engineers;

CREATE POLICY "Engineers can view their data"
  ON engineers
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = engineers.user_id
      AND profiles.id = auth.uid()
    )
  );