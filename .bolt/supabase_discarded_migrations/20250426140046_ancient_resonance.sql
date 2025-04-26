/*
  # Add Admin Booking Approval Function
  
  1. Changes
    - Add function for admin to approve and assign engineer
    - Add proper status transitions
    - Add validation checks
*/

-- Create function to handle admin booking approval
CREATE OR REPLACE FUNCTION approve_engineer_booking(
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

  -- Get current booking status
  SELECT status INTO v_booking_status
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  -- Validate booking exists and is in correct state
  IF v_booking_status IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

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

  -- Update booking
  UPDATE bookings
  SET 
    status = 'engineer_assigned',
    engineer_id = p_engineer_id,
    admin_id = auth.uid()
  WHERE id = p_booking_id
  AND status = 'pending';

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'engineer_id', p_engineer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;