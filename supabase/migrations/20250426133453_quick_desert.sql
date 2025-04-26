/*
  # Update Engineer Booking Workflow
  
  1. Changes
    - Update booking policies to show both pending and approved requests
    - Add proper status transitions for engineer acceptance
    - Fix race conditions in booking acceptance
    - Add proper error messages in Arabic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;

-- Create new booking policies
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    -- Engineers can see pending and open bookings, plus their own
    (
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND (
        -- Can see pending and open bookings
        status IN ('pending', 'open')
        OR
        -- Can see their own bookings
        (engineer_id IN (
          SELECT id FROM engineers
          WHERE user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to handle engineer response with proper locking
CREATE OR REPLACE FUNCTION handle_engineer_response(
  p_booking_id uuid,
  p_status text,
  p_rejection_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_engineer_id uuid;
  v_response_id uuid;
  v_booking_status text;
  v_booking_engineer_id uuid;
BEGIN
  -- Get engineer ID
  SELECT id INTO v_engineer_id
  FROM engineers
  WHERE user_id = auth.uid()
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Engineer not found or inactive';
  END IF;

  -- Lock the booking row to prevent race conditions
  SELECT status, engineer_id INTO v_booking_status, v_booking_engineer_id
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  -- Check booking status
  IF v_booking_status NOT IN ('pending', 'open') THEN
    IF v_booking_status = 'engineer_assigned' THEN
      -- Another engineer already accepted the booking
      RAISE EXCEPTION 'تم حجز هذا الطلب من قبل مهندس آخر';
    ELSE
      -- Booking is in another state
      RAISE EXCEPTION 'هذا الطلب غير متاح للقبول';
    END IF;
  END IF;

  -- Check for existing response from this engineer
  IF EXISTS (
    SELECT 1 FROM engineer_responses
    WHERE booking_id = p_booking_id
    AND engineer_id = v_engineer_id
  ) THEN
    RAISE EXCEPTION 'لقد قمت بالرد على هذا الطلب مسبقاً';
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
    WHERE id = p_booking_id
    AND status IN ('pending', 'open');

    -- Check if update was successful
    IF NOT FOUND THEN
      -- Another engineer accepted the booking while we were processing
      RAISE EXCEPTION 'تم حجز هذا الطلب من قبل مهندس آخر';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'response_id', v_response_id,
    'booking_id', p_booking_id,
    'status', p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_multi 
ON bookings(status, engineer_id, booking_date);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_booking_engineer 
ON engineer_responses(booking_id, engineer_id);