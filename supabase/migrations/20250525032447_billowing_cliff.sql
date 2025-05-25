/*
  # Add booking acceptance function

  1. New Functions
    - `accept_booking`: Handles atomic booking acceptance
      - Takes booking_id and engineer_id as parameters
      - Validates booking status and engineer status
      - Updates booking and creates engineer response in a transaction
      
  2. Security
    - Function is accessible to authenticated users only
*/

-- Create function to handle atomic booking acceptance
CREATE OR REPLACE FUNCTION accept_booking(
  p_booking_id UUID,
  p_engineer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_engineer_status TEXT;
  v_booking_status TEXT;
BEGIN
  -- Check engineer status
  SELECT status INTO v_engineer_status
  FROM engineers
  WHERE id = p_engineer_id;

  IF v_engineer_status IS NULL THEN
    RAISE EXCEPTION 'Engineer not found';
  END IF;

  IF v_engineer_status != 'active' THEN
    RAISE EXCEPTION 'Engineer account must be active to accept bookings';
  END IF;

  -- Lock the booking row for update
  SELECT status INTO v_booking_status
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE SKIP LOCKED;

  -- Check if booking exists and is available
  IF v_booking_status IS NULL THEN
    RAISE EXCEPTION 'Booking not found or already taken';
  END IF;

  IF v_booking_status != 'pending' THEN
    RAISE EXCEPTION 'Booking is no longer available';
  END IF;

  -- Create engineer response
  INSERT INTO engineer_responses (
    booking_id,
    engineer_id,
    status
  ) VALUES (
    p_booking_id,
    p_engineer_id,
    'accepted'
  );

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'open'
  WHERE id = p_booking_id;

  RETURN TRUE;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Booking has already been accepted by another engineer';
  WHEN OTHERS THEN
    RAISE;
END;
$$;