-- Safely add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'engineers_user_id_fkey'
    AND table_name = 'engineers'
  ) THEN
    -- Add the constraint only if it doesn't exist
    ALTER TABLE engineers
    ADD CONSTRAINT engineers_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_engineers_user_id ON engineers(user_id);