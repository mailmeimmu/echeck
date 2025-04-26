/*
  # Add engineer support to bookings

  1. Changes
    - Add engineer_id column to bookings table
    - Add status constraint for booking states
  
  2. Security
    - Add policies for engineer access to bookings
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
END $$;

-- Drop existing policies that depend on status column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Engineers can view approved and own confirmed bookings'
  ) THEN
    DROP POLICY "Engineers can view approved and own confirmed bookings" ON bookings;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Engineers can confirm bookings'
  ) THEN
    DROP POLICY "Engineers can confirm bookings" ON bookings;
  END IF;
END $$;

-- Add status constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'bookings' AND constraint_name = 'booking_status_check'
  ) THEN
    ALTER TABLE bookings 
      ADD CONSTRAINT booking_status_check 
      CHECK (status IN ('pending', 'approved', 'confirmed', 'completed', 'cancelled'));
  END IF;
END $$;

-- Recreate engineer booking policies
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