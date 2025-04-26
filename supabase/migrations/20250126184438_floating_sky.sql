-- Drop existing policies temporarily
DROP POLICY IF EXISTS "Engineers can view their inspections" ON inspections;
DROP POLICY IF EXISTS "Engineers can create inspections" ON inspections;
DROP POLICY IF EXISTS "Users can view their inspection reports" ON inspections;

-- Add user_id to engineers if not exists and ensure proper relationships
DO $$ 
BEGIN
  -- First ensure user_id exists and is properly typed
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

  -- Ensure proper foreign key to auth.users
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

-- Recreate policies with proper joins
CREATE POLICY "Engineers can view their inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    engineer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can create inspections"
  ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    engineer_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM engineers 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
    AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.engineer_id = auth.uid()
      AND bookings.status = 'confirmed'
    )
  );

CREATE POLICY "Users can view their inspection reports"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_engineers_user_id ON engineers(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_engineer_id ON inspections(engineer_id);
CREATE INDEX IF NOT EXISTS idx_inspections_booking_id ON inspections(booking_id);