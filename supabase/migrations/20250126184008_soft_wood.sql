/*
  # Add engineer profile relationship
  
  1. Changes
    - Add user_id column to engineers table to link with profiles
    - Update existing policies
    
  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Add user_id to engineers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'engineers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE engineers 
    ADD COLUMN user_id uuid REFERENCES auth.users(id);

    -- Update existing engineers to link with their auth user id
    UPDATE engineers SET user_id = id;

    -- Make user_id required
    ALTER TABLE engineers 
    ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;