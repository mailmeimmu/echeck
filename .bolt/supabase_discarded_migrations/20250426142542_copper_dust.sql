/*
  # Fix Booking Workflow
  
  1. Changes
    - Update booking status workflow
    - Fix race conditions in engineer responses
    - Add proper error messages in Arabic
    - Add validation for status transitions
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS approve_engineer_booking(uuid, uuid);
DROP FUNCTION IF EXISTS handle_engineer_response(uuid, text, uuid, text);

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

  -- Update booking status to open
  UPDATE bookings
  SET 
    status = 'open',
    admin_id = auth.uid()
  WHERE id = p_booking_id
  AND status = 'pending';

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle engineer response
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
  v_booking_status text;
BEGIN
  -- Get engineer ID
  SELECT id INTO v_engineer_id
  FROM engineers
  WHERE user_id = auth.uid()
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'المهندس غير موجود أو غير نشط';
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
  IF v_booking_status != 'open' THEN
    IF v_booking_status = 'engineer_assigned' THEN
      RAISE EXCEPTION 'تم حجز هذا الطلب من قبل مهندس آخر';
    ELSE
      RAISE EXCEPTION 'هذا الطلب غير متاح للقبول';
    END IF;
  END IF;

  -- Check for existing response
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
    AND status = 'open';

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

EXCEPTION
  WHEN unique_violation THEN
    -- Handle the case where another process created the response
    RAISE EXCEPTION 'لقد قمت بالرد على هذا الطلب مسبقاً';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger
DROP TRIGGER IF EXISTS handle_booking_status_trigger ON bookings;
DROP FUNCTION IF EXISTS handle_booking_status_transition();

-- Create function to handle booking status transitions
CREATE FUNCTION handle_booking_status_transition()
RETURNS trigger AS $$
BEGIN
  -- For new bookings
  IF TG_OP = 'INSERT' THEN
    -- Admin-created bookings start as pending
    IF EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    ) THEN
      NEW.status := 'pending';
    END IF;
  END IF;

  -- For updates
  IF TG_OP = 'UPDATE' THEN
    -- Only allow specific status transitions
    CASE OLD.status
      -- From pending, admin can set to open
      WHEN 'pending' THEN
        IF NEW.status = 'open' AND EXISTS (
          SELECT 1 FROM admin_users WHERE id = auth.uid()
        ) THEN
          -- Valid transition
          NULL;
        ELSE
          RAISE EXCEPTION 'لا يمكن تغيير حالة الطلب من قيد المراجعة';
        END IF;

      -- From open, engineer can accept
      WHEN 'open' THEN
        IF NEW.status = 'engineer_assigned' AND EXISTS (
          SELECT 1 FROM engineers 
          WHERE id = NEW.engineer_id 
          AND user_id = auth.uid()
          AND status = 'active'
        ) THEN
          -- Valid transition
          NULL;
        ELSE
          RAISE EXCEPTION 'لا يمكن تغيير حالة الطلب من متاح للمهندسين';
        END IF;

      -- From engineer_assigned, engineer can start inspection
      WHEN 'engineer_assigned' THEN
        IF NEW.status = 'in_progress' AND EXISTS (
          SELECT 1 FROM engineers 
          WHERE id = OLD.engineer_id 
          AND user_id = auth.uid()
          AND status = 'active'
        ) THEN
          -- Valid transition
          NULL;
        ELSE
          RAISE EXCEPTION 'لا يمكن تغيير حالة الطلب من تم تعيين مهندس';
        END IF;

      -- From in_progress, engineer can complete
      WHEN 'in_progress' THEN
        IF NEW.status = 'completed' AND EXISTS (
          SELECT 1 FROM engineers 
          WHERE id = OLD.engineer_id 
          AND user_id = auth.uid()
          AND status = 'active'
        ) THEN
          -- Valid transition
          NULL;
        ELSE
          RAISE EXCEPTION 'لا يمكن تغيير حالة الطلب من جاري الفحص';
        END IF;

      ELSE
        RAISE EXCEPTION 'لا يمكن تغيير حالة الطلب من %', OLD.status;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status transitions
CREATE TRIGGER handle_booking_status_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_status_transition();