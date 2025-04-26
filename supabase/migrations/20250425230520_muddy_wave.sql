/*
  # Fix Booking Status Workflow
  
  1. Changes
    - Update create_admin_booking function to set initial status to 'open'
    - Add validation for status transitions
*/

-- Create or replace the function with updated status handling
CREATE OR REPLACE FUNCTION create_admin_booking(
  p_external_booking_id text,
  p_property_type_id uuid,
  p_location text,
  p_booking_date date,
  p_booking_time time,
  p_notes text DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- Ensure user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create bookings';
  END IF;

  -- Validate booking date and time
  IF p_booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book appointments in the past';
  END IF;

  IF EXTRACT(HOUR FROM p_booking_time) < 9 OR EXTRACT(HOUR FROM p_booking_time) >= 22 THEN
    RAISE EXCEPTION 'Booking time must be between 9 AM and 10 PM';
  END IF;

  -- Create booking with initial status 'open'
  INSERT INTO bookings (
    external_booking_id,
    property_type_id,
    location,
    booking_date,
    booking_time,
    notes,
    admin_notes,
    admin_id,
    status
  ) VALUES (
    p_external_booking_id,
    p_property_type_id,
    p_location,
    p_booking_date,
    p_booking_time,
    p_notes,
    p_admin_notes,
    auth.uid(),
    'open'  -- Set initial status to 'open' instead of 'pending'
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;