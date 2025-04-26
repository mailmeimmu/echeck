/*
  # Fix Booking Status Constraint
  
  1. Changes
    - Update booking status check constraint to include 'pending'
    - Ensure proper status flow for admin-created bookings
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_engineer 
ON bookings(status, engineer_id);