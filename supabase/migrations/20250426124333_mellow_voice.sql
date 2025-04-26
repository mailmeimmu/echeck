/*
  # Fix Booking Visibility for Engineers
  
  1. Changes
    - Update booking status workflow
    - Fix engineer booking policies
    - Add proper indexes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view bookings" ON bookings;

-- Create new policy for engineers to view bookings
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    -- Engineers can see pending and open bookings
    (
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND status IN ('pending', 'open')
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_multi 
ON bookings(status, engineer_id, booking_date);

-- Create function to handle booking status transitions
CREATE OR REPLACE FUNCTION handle_booking_status_transition()
RETURNS trigger AS $$
BEGIN
  -- When a booking is created by admin, set status to pending
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  END IF;

  -- When an engineer is assigned, update status
  IF TG_OP = 'UPDATE' AND NEW.engineer_id IS NOT NULL AND OLD.engineer_id IS NULL THEN
    NEW.status := 'engineer_assigned';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status transitions
DROP TRIGGER IF EXISTS handle_booking_status_trigger ON bookings;
CREATE TRIGGER handle_booking_status_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_status_transition();