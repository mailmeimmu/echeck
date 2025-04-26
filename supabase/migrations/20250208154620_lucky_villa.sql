-- Drop existing policies
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

-- Create new policies that allow multiple bookings
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only require user authentication
    auth.uid() = user_id
    AND
    -- Basic validation
    booking_date >= CURRENT_DATE
    AND
    -- Ensure time is within working hours (9 AM to 10 PM)
    EXTRACT(HOUR FROM booking_time) BETWEEN 9 AND 22
  );

CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND status NOT IN ('completed', 'cancelled')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status NOT IN ('completed', 'cancelled')
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_date_time
ON bookings(user_id, booking_date, booking_time);

-- Update or create the validation function
CREATE OR REPLACE FUNCTION validate_booking()
RETURNS trigger AS $$
BEGIN
  -- Ensure booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'لا يمكن حجز موعد في تاريخ سابق';
  END IF;

  -- Ensure booking time is within working hours (9 AM to 10 PM)
  IF EXTRACT(HOUR FROM NEW.booking_time) < 9 OR EXTRACT(HOUR FROM NEW.booking_time) >= 22 THEN
    RAISE EXCEPTION 'وقت الحجز يجب أن يكون بين الساعة 9 صباحاً و 10 مساءً';
  END IF;

  -- Check for concurrent booking by same user
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE user_id = NEW.user_id
    AND booking_date = NEW.booking_date
    AND booking_time = NEW.booking_time
    AND id != NEW.id
    AND status NOT IN ('cancelled', 'completed')
  ) THEN
    RAISE EXCEPTION 'لديك حجز آخر في نفس الوقت';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS validate_booking_trigger ON bookings;

CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking();