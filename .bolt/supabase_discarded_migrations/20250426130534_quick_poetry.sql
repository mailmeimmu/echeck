/*
  # Update Booking Workflow and Inspection Form
  
  1. Changes
    - Add admin approval step for engineer assignments
    - Update booking status transitions
    - Add inspection form display logic
    - Add proper constraints and validations
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS handle_booking_status_trigger ON bookings;
DROP FUNCTION IF EXISTS handle_booking_status_transition();

-- Create function to handle booking status transitions
CREATE OR REPLACE FUNCTION handle_booking_status_transition()
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
          RAISE EXCEPTION 'Invalid status transition from pending';
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
          RAISE EXCEPTION 'Invalid status transition from open';
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
          RAISE EXCEPTION 'Invalid status transition from engineer_assigned';
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
          RAISE EXCEPTION 'Invalid status transition from in_progress';
        END IF;

      ELSE
        RAISE EXCEPTION 'Invalid status transition from %', OLD.status;
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

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;

-- Create new booking policies
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    -- Engineers can see open bookings
    (
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

-- Create function to handle engineer response
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

-- Create function to start inspection
CREATE OR REPLACE FUNCTION start_inspection(p_booking_id uuid)
RETURNS jsonb AS $$
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

  -- Validate booking
  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE id = p_booking_id
    AND engineer_id = v_engineer_id
    AND status = 'engineer_assigned'
  ) THEN
    RAISE EXCEPTION 'Invalid booking or status';
  END IF;

  -- Update booking status
  UPDATE bookings
  SET status = 'in_progress'
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_multi 
ON bookings(status, engineer_id, booking_date);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_booking 
ON engineer_responses(booking_id);

CREATE INDEX IF NOT EXISTS idx_engineer_responses_engineer 
ON engineer_responses(engineer_id);