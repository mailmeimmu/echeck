/*
  # Fix Booking Visibility and Response System
  
  1. Changes
    - Update booking policies to allow engineers to view open bookings
    - Add policies for engineer responses
    - Add proper status transitions
*/

-- Drop existing booking policies
DROP POLICY IF EXISTS "Engineers can view available bookings" ON bookings;
DROP POLICY IF EXISTS "Engineers can view assigned bookings" ON bookings;

-- Create new booking policies
CREATE POLICY "Engineers can view available bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND status = 'open'
    )
    OR
    (
      engineer_id IN (
        SELECT id FROM engineers
        WHERE user_id = auth.uid()
      )
    )
  );

-- Drop existing engineer response policies
DROP POLICY IF EXISTS "Engineers can create responses" ON engineer_responses;
DROP POLICY IF EXISTS "Engineers can view their responses" ON engineer_responses;

-- Create new engineer response policies
CREATE POLICY "Engineers can create responses"
  ON engineer_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineers e
      WHERE e.id = engineer_responses.engineer_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
    )
    AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = engineer_responses.booking_id
      AND b.status = 'open'
    )
  );

CREATE POLICY "Engineers can view their responses"
  ON engineer_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM engineers e
      WHERE e.id = engineer_responses.engineer_id
      AND e.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_engineer 
ON bookings(status, engineer_id);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_booking 
ON engineer_responses(booking_id);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_engineer 
ON engineer_responses(engineer_id);