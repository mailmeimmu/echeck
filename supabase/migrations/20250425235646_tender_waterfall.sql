/*
  # Update Booking Workflow for Engineer Responses
  
  1. Changes
    - Update booking policies to allow engineers to view open bookings
    - Add policies for engineer responses
    - Add proper status transitions
    - Add indexes for better performance
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
      -- Engineers can see open bookings
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND status = 'open'
    )
    OR
    -- Engineers can see their assigned bookings
    engineer_id IN (
      SELECT id FROM engineers
      WHERE user_id = auth.uid()
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
    -- Engineer must be active
    EXISTS (
      SELECT 1 FROM engineers e
      WHERE e.id = engineer_responses.engineer_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
    )
    AND
    -- Booking must be open
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = engineer_responses.booking_id
      AND b.status = 'open'
    )
    AND
    -- Engineer hasn't already responded
    NOT EXISTS (
      SELECT 1 FROM engineer_responses er
      WHERE er.booking_id = engineer_responses.booking_id
      AND er.engineer_id = engineer_responses.engineer_id
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

-- Add function to handle engineer response
CREATE OR REPLACE FUNCTION handle_engineer_response(
  p_booking_id uuid,
  p_status text,
  p_rejection_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_engineer_id uuid;
BEGIN
  -- Get engineer ID
  SELECT id INTO v_engineer_id
  FROM engineers
  WHERE user_id = auth.uid()
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Engineer not found or inactive';
  END IF;

  -- Validate booking status
  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE id = p_booking_id
    AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'Booking is not available';
  END IF;

  -- Create response
  INSERT INTO engineer_responses (
    booking_id,
    engineer_id,
    status,
    rejection_reason_id,
    notes
  ) VALUES (
    p_booking_id,
    v_engineer_id,
    p_status,
    p_rejection_reason_id,
    p_notes
  );

  -- If accepted, update booking status
  IF p_status = 'accepted' THEN
    UPDATE bookings
    SET 
      status = 'engineer_assigned',
      engineer_id = v_engineer_id
    WHERE id = p_booking_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_engineer 
ON bookings(status, engineer_id);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_booking 
ON engineer_responses(booking_id);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_engineer 
ON engineer_responses(engineer_id);