/*
  # Add Platform Admin Support
  
  1. Changes
    - Add admin role to auth schema
    - Add admin_users table
    - Update bookings table for admin management
    - Add policies for admin access
*/

-- Create admin_users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL CHECK (email LIKE '%@admin.check.sa'),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin policies
CREATE POLICY "Admin can view own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Add admin-specific columns to bookings if they don't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS external_booking_id text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);

-- Create index for external booking ID
CREATE INDEX IF NOT EXISTS idx_bookings_external_id ON bookings(external_booking_id);

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

-- Drop existing booking policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
END $$;

-- Create admin booking policies
CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle admin booking creation
CREATE OR REPLACE FUNCTION create_admin_booking(
  p_external_booking_id text,
  p_property_type_id uuid,
  p_location text,
  p_booking_date date,
  p_booking_time time,
  p_notes text DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- Ensure user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create bookings';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    external_booking_id,
    property_type_id,
    location,
    booking_date,
    booking_time,
    notes,
    admin_notes,
    admin_id,
    status
  ) VALUES (
    p_external_booking_id,
    p_property_type_id,
    p_location,
    p_booking_date,
    p_booking_time,
    p_notes,
    p_admin_notes,
    auth.uid(),
    'open'
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle admin booking approval
CREATE OR REPLACE FUNCTION approve_engineer_booking(
  p_booking_id uuid,
  p_engineer_id uuid
)
RETURNS void AS $$
BEGIN
  -- Ensure user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve bookings';
  END IF;

  -- Update booking status and assign engineer
  UPDATE bookings
  SET 
    status = 'engineer_assigned',
    engineer_id = p_engineer_id
  WHERE id = p_booking_id;

  -- If no rows were updated, booking doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user if not exists
INSERT INTO admin_users (id, email)
SELECT 
  id,
  email
FROM auth.users
WHERE email LIKE '%@admin.check.sa'
ON CONFLICT (email) DO NOTHING;