/*
  # Fix Booking Status Handling
  
  1. Changes
    - Update booking status constraint
    - Create function for admin booking creation
    - Add proper validation
*/

-- Drop existing constraint if it exists
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS booking_status_check;

-- Add updated status constraint
ALTER TABLE bookings 
ADD CONSTRAINT booking_status_check 
CHECK (status IN ('pending', 'open', 'engineer_assigned', 'rejected', 'in_progress', 'completed', 'cancelled'));

-- Create function for admin booking creation
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
  -- Check admin authorization
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create bookings';
  END IF;

  -- Validate date
  IF p_booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book appointments in the past';
  END IF;

  -- Validate time (9 AM to 10 PM)
  IF EXTRACT(HOUR FROM p_booking_time) < 9 OR EXTRACT(HOUR FROM p_booking_time) >= 22 THEN
    RAISE EXCEPTION 'Booking time must be between 9 AM and 10 PM';
  END IF;

  -- Create booking
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
    'open'
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;