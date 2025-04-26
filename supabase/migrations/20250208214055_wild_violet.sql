-- Drop existing constraints and triggers
DROP TRIGGER IF EXISTS validate_booking_trigger ON bookings;
DROP TRIGGER IF EXISTS validate_booking_status_transition_trigger ON bookings;
DROP TRIGGER IF EXISTS check_booking_conflict_trigger ON bookings;

DROP FUNCTION IF EXISTS validate_booking();
DROP FUNCTION IF EXISTS validate_booking_status_transition();
DROP FUNCTION IF EXISTS check_booking_conflict();

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_check;

-- Add new status constraint
ALTER TABLE bookings 
ADD CONSTRAINT booking_status_check 
CHECK (status IN (
  'requested',    -- Initial status when user creates booking
  'approved',     -- Platform manager approved
  'assigned',     -- Engineer assigned
  'in_progress',  -- Engineer started inspection
  'completed',    -- Inspection completed
  'cancelled'     -- Booking cancelled
));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_engineer 
ON bookings(status, engineer_id);

-- Create function to validate booking date and time
CREATE OR REPLACE FUNCTION validate_booking_datetime(booking_date date, booking_time time)
RETURNS boolean AS $$
DECLARE
  booking_hour integer;
BEGIN
  -- Check if date is in the past
  IF booking_date < CURRENT_DATE THEN
    RETURN false;
  END IF;

  -- Check if time is within working hours
  booking_hour := EXTRACT(HOUR FROM booking_time);
  RETURN booking_hour >= 9 AND booking_hour < 22;
END;
$$ LANGUAGE plpgsql;

-- Create function to check status transition validity
CREATE OR REPLACE FUNCTION is_valid_status_transition(old_status text, new_status text)
RETURNS boolean AS $$
BEGIN
  -- Return true if status hasn't changed
  IF old_status = new_status THEN
    RETURN true;
  END IF;

  -- Define valid transitions
  RETURN CASE old_status
    WHEN 'requested' THEN new_status IN ('approved', 'cancelled')
    WHEN 'approved' THEN new_status IN ('assigned', 'cancelled')
    WHEN 'assigned' THEN new_status IN ('in_progress', 'cancelled')
    WHEN 'in_progress' THEN new_status IN ('completed', 'cancelled')
    ELSE false -- No transitions allowed from completed or cancelled
  END;
END;
$$ LANGUAGE plpgsql;

-- Update policies
DROP POLICY IF EXISTS "Engineers can view approved and own confirmed bookings" ON bookings;
DROP POLICY IF EXISTS "Engineers can confirm bookings" ON bookings;
DROP POLICY IF EXISTS "Engineers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Engineers can update assigned bookings" ON bookings;

-- Create new policies
CREATE POLICY "Engineers can view assigned bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    engineer_id = auth.uid()
    AND status IN ('assigned', 'in_progress')
  );

CREATE POLICY "Engineers can update assigned bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    engineer_id = auth.uid()
    AND status IN ('assigned', 'in_progress')
  );

-- Create trigger function for booking validation
CREATE OR REPLACE FUNCTION validate_booking_trigger_func()
RETURNS trigger AS $$
BEGIN
  -- For new bookings
  IF TG_OP = 'INSERT' THEN
    -- Set initial status
    NEW.status := 'requested';
    
    -- Validate date and time
    IF NOT validate_booking_datetime(NEW.booking_date, NEW.booking_time) THEN
      RAISE EXCEPTION 'Invalid booking date or time';
    END IF;
  
  -- For status updates
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Validate status transition
    IF NOT is_valid_status_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_trigger_func();