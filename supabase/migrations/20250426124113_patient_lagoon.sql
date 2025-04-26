/*
  # Fix Engineer Booking Visibility
  
  1. Changes
    - Update booking policies to allow engineers to view pending bookings
    - Add proper status checks
    - Improve query performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view bookings" ON bookings;

-- Create new policy for engineers to view bookings
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (
      -- Engineers can see pending bookings
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND status = 'pending'
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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_date
ON bookings(status, booking_date);