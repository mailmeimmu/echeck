-- Drop existing policies
DROP POLICY IF EXISTS "Users can create multiple bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;

-- Create comprehensive booking policies
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
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

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add validation function for bookings
CREATE OR REPLACE FUNCTION validate_booking()
RETURNS trigger AS $$
BEGIN
  -- Ensure booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book appointments in the past';
  END IF;

  -- Ensure booking time is within working hours (9 AM to 10 PM)
  IF EXTRACT(HOUR FROM NEW.booking_time) < 9 OR EXTRACT(HOUR FROM NEW.booking_time) >= 22 THEN
    RAISE EXCEPTION 'Booking time must be between 9 AM and 10 PM';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_booking_trigger ON bookings;

CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking();