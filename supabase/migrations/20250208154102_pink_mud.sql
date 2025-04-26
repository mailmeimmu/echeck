-- Drop existing policies that might restrict multiple bookings
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;

-- Create new policy that allows multiple bookings
CREATE POLICY "Users can create multiple bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND
    -- Basic validation
    booking_date >= CURRENT_DATE
    AND
    -- Ensure time is within working hours (9 AM to 10 PM)
    EXTRACT(HOUR FROM booking_time) BETWEEN 9 AND 22
  );

-- Add index for better performance on user bookings queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_date
ON bookings(user_id, booking_date);

-- Add function to check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE engineer_id = NEW.engineer_id
    AND booking_date = NEW.booking_date
    AND booking_time = NEW.booking_time
    AND status NOT IN ('cancelled', 'completed')
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Booking conflict: Engineer already has an appointment at this time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for booking conflict check
DROP TRIGGER IF EXISTS check_booking_conflict_trigger ON bookings;

CREATE TRIGGER check_booking_conflict_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.engineer_id IS NOT NULL)
  EXECUTE FUNCTION check_booking_conflict();