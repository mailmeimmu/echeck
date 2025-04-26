/*
  # Add engineer support to bookings

  1. Changes
    - Add engineer_id column to bookings table
    - Add status enum constraint
    - Add policies for engineer access
  
  2. Security
    - Add policies for engineers to view and update bookings
*/

-- Add engineer_id to bookings
DO $$ 
BEGIN
  -- Add engineer_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'engineer_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN engineer_id uuid REFERENCES engineers(id);
  END IF;

  -- Modify status column to use enum constraint
  ALTER TABLE bookings 
    ALTER COLUMN status SET DATA TYPE text,
    ADD CONSTRAINT booking_status_check 
    CHECK (status IN ('pending', 'approved', 'confirmed', 'completed', 'cancelled'));
END $$;

-- Engineer booking policies
CREATE POLICY "Engineers can view approved and own confirmed bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (status = 'approved' AND EXISTS (
      SELECT 1 FROM engineers WHERE id = auth.uid() AND status = 'active'
    ))
    OR
    (engineer_id = auth.uid())
  );

CREATE POLICY "Engineers can confirm bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    status = 'approved' 
    AND EXISTS (
      SELECT 1 FROM engineers WHERE id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    status = 'confirmed' 
    AND engineer_id = auth.uid()
  );