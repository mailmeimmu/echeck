-- Drop existing foreign key if it exists
ALTER TABLE engineers 
DROP CONSTRAINT IF EXISTS engineers_user_id_fkey;

-- Ensure user_id exists and is properly typed
DO $$ 
BEGIN
  -- Add user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'engineers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE engineers ADD COLUMN user_id uuid;
  END IF;

  -- Update existing engineers to use their id as user_id if not set
  UPDATE engineers SET user_id = id WHERE user_id IS NULL;

  -- Make user_id NOT NULL after ensuring data is present
  ALTER TABLE engineers ALTER COLUMN user_id SET NOT NULL;

  -- Add foreign key to auth.users
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'engineers_user_id_fkey_auth'
  ) THEN
    ALTER TABLE engineers
    ADD CONSTRAINT engineers_user_id_fkey_auth
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_engineers_user_id ON engineers(user_id);

-- Update policies if needed
DROP POLICY IF EXISTS "Engineers can view their data" ON engineers;
CREATE POLICY "Engineers can view their data"
  ON engineers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());