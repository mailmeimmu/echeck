/*
  # Fix Admin Booking Control Panel
  
  1. Changes
    - Add proper admin policies for booking management
    - Update booking status workflow
    - Add functions for admin booking operations
*/

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;

-- Create comprehensive admin policies
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

-- Create function to handle admin booking approval
CREATE OR REPLACE FUNCTION approve_engineer_booking(
  p_booking_id uuid,
  p_engineer_id uuid
)
RETURNS void AS $$
BEGIN
  -- Ensure user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve bookings';
  END IF;

  -- Validate booking exists and is in correct state
  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE id = p_booking_id
    AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'Invalid booking or status';
  END IF;

  -- Validate engineer exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM engineers
    WHERE id = p_engineer_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid engineer or inactive status';
  END IF;

  -- Update booking
  UPDATE bookings
  SET 
    status = 'engineer_assigned',
    engineer_id = p_engineer_id,
    admin_id = auth.uid()
  WHERE id = p_booking_id;

  -- If no rows were updated, booking doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle admin booking rejection
CREATE OR REPLACE FUNCTION reject_booking(
  p_booking_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Ensure user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reject bookings';
  END IF;

  -- Update booking
  UPDATE bookings
  SET 
    status = 'rejected',
    admin_notes = COALESCE(admin_notes || E'\n', '') || 'Rejected: ' || COALESCE(p_notes, 'No reason provided'),
    admin_id = auth.uid()
  WHERE id = p_booking_id
  AND status IN ('open', 'pending');

  -- If no rows were updated, booking doesn't exist or is in wrong state
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or cannot be rejected';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_admin_id ON bookings(admin_id);
CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_date ON bookings(user_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);