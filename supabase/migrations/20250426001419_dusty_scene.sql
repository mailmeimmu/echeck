/*
  # Fix Engineer Booking System
  
  1. Changes
    - Update booking policies to properly handle engineer access
    - Add proper status transitions
    - Fix engineer response handling
*/

-- Drop existing booking policies
DROP POLICY IF EXISTS "Engineers can view available bookings" ON bookings;
DROP POLICY IF EXISTS "Engineers can view assigned bookings" ON bookings;

-- Create new booking policies
CREATE POLICY "Engineers can view bookings"
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
    (
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND id = bookings.engineer_id
      )
    )
  );

-- Drop existing function first
DROP FUNCTION IF EXISTS handle_engineer_response(uuid, text, uuid, text);

-- Create new function
CREATE FUNCTION handle_engineer_response(
  p_booking_id uuid,
  p_status text,
  p_rejection_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_engineer_id uuid;
  v_response_id uuid;
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

  -- Check for existing response
  IF EXISTS (
    SELECT 1 FROM engineer_responses
    WHERE booking_id = p_booking_id
    AND engineer_id = v_engineer_id
  ) THEN
    RAISE EXCEPTION 'Already responded to this booking';
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
    CASE WHEN p_status = 'rejected' THEN p_rejection_reason_id ELSE NULL END,
    p_notes
  )
  RETURNING id INTO v_response_id;

  -- If accepted, update booking status
  IF p_status = 'accepted' THEN
    UPDATE bookings
    SET 
      status = 'engineer_assigned',
      engineer_id = v_engineer_id
    WHERE id = p_booking_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'response_id', v_response_id,
    'booking_id', p_booking_id,
    'status', p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;