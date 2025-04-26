/*
  # Fix Booking Acceptance Process
  
  1. Changes
    - Update approve_engineer_booking function to handle duplicate responses
    - Add proper error messages in Arabic
    - Fix race conditions
*/

-- Drop existing function
DROP FUNCTION IF EXISTS approve_engineer_booking(uuid, uuid);

-- Create function to handle admin booking approval
CREATE FUNCTION approve_engineer_booking(
  p_booking_id uuid,
  p_engineer_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_booking_status text;
BEGIN
  -- Ensure user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'غير مصرح: فقط المشرفين يمكنهم الموافقة على الطلبات';
  END IF;

  -- Lock the booking row and get current status
  SELECT status INTO v_booking_status
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  -- Validate booking exists
  IF v_booking_status IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  -- Validate booking status
  IF v_booking_status != 'pending' THEN
    RAISE EXCEPTION 'لا يمكن تعيين مهندس لهذا الطلب في حالته الحالية';
  END IF;

  -- Validate engineer exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM engineers
    WHERE id = p_engineer_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'المهندس غير موجود أو غير نشط';
  END IF;

  -- Check for existing response
  IF EXISTS (
    SELECT 1 FROM engineer_responses
    WHERE booking_id = p_booking_id
    AND engineer_id = p_engineer_id
  ) THEN
    RAISE EXCEPTION 'المهندس قد قام بالرد على هذا الطلب مسبقاً';
  END IF;

  -- Update booking status and assign engineer
  UPDATE bookings
  SET 
    status = 'engineer_assigned',
    engineer_id = p_engineer_id,
    admin_id = auth.uid()
  WHERE id = p_booking_id
  AND status = 'pending';

  -- Create an engineer response record
  INSERT INTO engineer_responses (
    booking_id,
    engineer_id,
    status
  ) VALUES (
    p_booking_id,
    p_engineer_id,
    'accepted'
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'engineer_id', p_engineer_id
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Handle the case where another process created the response
    RAISE EXCEPTION 'المهندس قد قام بالرد على هذا الطلب مسبقاً';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;