/*
  # Fix inspection policies
  
  1. Changes
    - Update RLS policies to properly handle engineer_id
    - Make engineer_id required for new inspections
*/

-- Make engineer_id required
ALTER TABLE inspections 
ALTER COLUMN engineer_id SET NOT NULL;

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
    -- Engineer must be authenticated and active
    EXISTS (
      SELECT 1 FROM engineers 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
    AND
    -- Engineer must be assigned to the booking and booking must be confirmed
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.engineer_id = auth.uid()
      AND bookings.status = 'confirmed'
    )
    AND
    -- Ensure engineer_id matches authenticated user
    engineer_id = auth.uid()
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