/*
  # Add simple inspection columns
  
  1. Changes
    - Add property_safe column (boolean) to inspections table
    - Add notes column (text) to inspections table
    - Update RLS policies to include new columns
*/

-- Add new columns to inspections table
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS property_safe boolean,
ADD COLUMN IF NOT EXISTS notes text;

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can create inspections" ON inspections;
DROP POLICY IF EXISTS "Engineers can view their inspections" ON inspections;
DROP POLICY IF EXISTS "Users can view their inspection reports" ON inspections;

-- Create new policies
CREATE POLICY "Engineers can create inspections"
  ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
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

CREATE POLICY "Engineers can view their inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    -- Engineers can view inspections they created
    engineer_id = auth.uid()
    OR
    -- Users can view inspections for their bookings
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
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