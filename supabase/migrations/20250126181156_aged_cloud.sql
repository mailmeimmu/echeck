-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view their inspections" ON inspections;
DROP POLICY IF EXISTS "Engineers can create inspections" ON inspections;

-- Create new policies for inspections
CREATE POLICY "Engineers can view their inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    -- Engineers can view inspections they created
    engineer_id = auth.uid()
    OR
    -- Users can view inspections for their bookings
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can create inspections"
  ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Engineer must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- Engineer must be active
    EXISTS (
      SELECT 1 FROM engineers 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
    AND
    -- Engineer must be assigned to the booking
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.engineer_id = auth.uid()
      AND bookings.status = 'confirmed'
    )
  );

-- Add policy for users to view their own inspection reports
CREATE POLICY "Users can view their inspection reports"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );