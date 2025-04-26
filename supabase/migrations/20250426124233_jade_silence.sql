/*
  # Fix Engineer Request Visibility
  
  1. Changes
    - Update booking status check constraint
    - Update booking policies for proper engineer access
    - Add indexes for better performance
*/

-- Drop existing status check constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS booking_status_check;

-- Add updated status check constraint
ALTER TABLE bookings 
ADD CONSTRAINT booking_status_check 
CHECK (status IN (
  'pending',           -- Initial status when admin creates booking
  'open',             -- Available for engineers to accept
  'engineer_assigned', -- Engineer accepted and admin approved
  'rejected',         -- All engineers rejected or admin rejected engineer
  'in_progress',      -- Inspection in progress
  'completed',        -- Inspection completed
  'cancelled'         -- Booking cancelled
));

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can view bookings" ON bookings;

-- Create new policy for engineers to view bookings
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (
      -- Engineers can see open bookings
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_engineer 
ON bookings(status, engineer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status_date
ON bookings(status, booking_date);