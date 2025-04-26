/*
  # Update Booking Workflow Schema
  
  1. Changes
    - Add external_booking_id for tracking bookings from external platform
    - Add engineer_responses table to track accept/reject responses
    - Add rejection_reasons table for standardized rejection tracking
    - Update booking statuses to match new workflow
    - Add admin_notes field for platform admin comments
*/

-- Drop all existing booking policies first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
  DROP POLICY IF EXISTS "Engineers can view assigned bookings" ON bookings;
  DROP POLICY IF EXISTS "Engineers can update assigned bookings" ON bookings;
  DROP POLICY IF EXISTS "Engineers can view approved and own confirmed bookings" ON bookings;
  DROP POLICY IF EXISTS "Engineers can confirm bookings" ON bookings;
END $$;

-- Add new columns to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS external_booking_id text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);

-- Create rejection_reasons table with unique name constraint
CREATE TABLE IF NOT EXISTS rejection_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create engineer_responses table
CREATE TABLE IF NOT EXISTS engineer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('accepted', 'rejected')),
  rejection_reason_id uuid REFERENCES rejection_reasons(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, engineer_id)
);

-- Update booking status enum
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS booking_status_check;

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

-- Enable RLS
ALTER TABLE rejection_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for rejection_reasons
CREATE POLICY "Anyone can read rejection reasons"
  ON rejection_reasons
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for engineer_responses
CREATE POLICY "Engineers can create responses"
  ON engineer_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineers
      WHERE id = engineer_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Engineers can view their responses"
  ON engineer_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM engineers
      WHERE id = engineer_id
      AND user_id = auth.uid()
    )
  );

-- Insert standard rejection reasons
DO $$
BEGIN
  INSERT INTO rejection_reasons (name, description)
  SELECT 'schedule_conflict', 'تعارض في الجدول الزمني'
  WHERE NOT EXISTS (SELECT 1 FROM rejection_reasons WHERE name = 'schedule_conflict');

  INSERT INTO rejection_reasons (name, description)
  SELECT 'location_far', 'الموقع بعيد جداً'
  WHERE NOT EXISTS (SELECT 1 FROM rejection_reasons WHERE name = 'location_far');

  INSERT INTO rejection_reasons (name, description)
  SELECT 'expertise_mismatch', 'نوع العقار خارج نطاق خبرتي'
  WHERE NOT EXISTS (SELECT 1 FROM rejection_reasons WHERE name = 'expertise_mismatch');

  INSERT INTO rejection_reasons (name, description)
  SELECT 'workload', 'حجم العمل الحالي لا يسمح'
  WHERE NOT EXISTS (SELECT 1 FROM rejection_reasons WHERE name = 'workload');

  INSERT INTO rejection_reasons (name, description)
  SELECT 'other', 'سبب آخر'
  WHERE NOT EXISTS (SELECT 1 FROM rejection_reasons WHERE name = 'other');
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_booking_id);
CREATE INDEX IF NOT EXISTS idx_engineer_responses_booking ON engineer_responses(booking_id);
CREATE INDEX IF NOT EXISTS idx_engineer_responses_engineer ON engineer_responses(engineer_id);

-- Create new booking policies
CREATE POLICY "Engineers can view available bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM engineers
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
    AND status = 'open'
  );

CREATE POLICY "Engineers can view assigned bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM engineer_responses er
      WHERE er.booking_id = id
      AND er.engineer_id IN (
        SELECT id FROM engineers
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create function to check if engineer can accept booking
CREATE OR REPLACE FUNCTION can_engineer_accept_booking(booking_id uuid, engineer_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND b.status = 'open'
    AND NOT EXISTS (
      SELECT 1 FROM engineer_responses er
      WHERE er.booking_id = b.id
      AND er.engineer_id = engineer_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;