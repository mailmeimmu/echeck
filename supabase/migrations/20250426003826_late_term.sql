/*
  # Initial Schema Setup for Check Platform
  
  1. Tables
    - profiles: User profiles for all users
    - admin_users: Platform administrators
    - engineers: Approved engineers
    - engineer_requests: Engineer registration requests
    - bookings: Inspection booking requests
    - inspections: Completed inspection reports
    - inspection_photos: Photo documentation
    
  2. Security
    - RLS policies for data access control
    - Proper constraints and validations
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow inspection photo access" ON storage.objects;
DROP POLICY IF EXISTS "Allow engineer uploads to inspection-photos" ON storage.objects;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS inspection_photos CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS engineer_responses CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS engineer_requests CASCADE;
DROP TABLE IF EXISTS engineers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email_verified boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  CONSTRAINT email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Create admin_users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL CHECK (
    email LIKE '%@yopmail.com' AND 
    email NOT LIKE 'engineer@%'
  ),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create engineers table
CREATE TABLE engineers (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  id_number text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create engineer_requests table
CREATE TABLE engineer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_number text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  email text UNIQUE NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT engineer_requests_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id),
  status text NOT NULL DEFAULT 'pending',
  location text NOT NULL DEFAULT '',
  notes text,
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  booking_time time NOT NULL DEFAULT '09:00:00',
  external_booking_id text,
  admin_notes text,
  admin_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT booking_status_check CHECK (
    status IN (
      'pending',
      'open',
      'engineer_assigned',
      'rejected',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  CONSTRAINT valid_time_range CHECK (
    EXTRACT(HOUR FROM booking_time) >= 9 AND 
    EXTRACT(HOUR FROM booking_time) < 22
  )
);

-- Create inspections table
CREATE TABLE inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers ON DELETE CASCADE NOT NULL,
  property_age integer NOT NULL,
  total_area numeric NOT NULL,
  floor_count integer NOT NULL,
  foundation_type text NOT NULL,
  foundation_condition text NOT NULL,
  wall_condition text NOT NULL,
  roof_condition text NOT NULL,
  property_safe boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_conditions CHECK (
    foundation_condition IN ('excellent', 'good', 'fair', 'poor') AND
    wall_condition IN ('excellent', 'good', 'fair', 'poor') AND
    roof_condition IN ('excellent', 'good', 'fair', 'poor')
  )
);

-- Create inspection_photos table
CREATE TABLE inspection_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  url text NOT NULL,
  section text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_section CHECK (
    section IN (
      'foundation_type',
      'foundation_condition',
      'wall_condition',
      'roof_condition'
    )
  )
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for admin_users
CREATE POLICY "Admin can view own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policies for engineers
CREATE POLICY "Engineers can view their data"
  ON engineers
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = engineers.user_id
      AND profiles.id = auth.uid()
    )
  );

-- Create policies for engineer_requests
CREATE POLICY "Anyone can insert engineer requests"
  ON engineer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM engineer_requests e
      WHERE e.id_number = id_number
      OR e.email = email
    )
  );

CREATE POLICY "Admin can view all requests"
  ON engineer_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create policies for bookings
CREATE POLICY "Engineers can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM engineers
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
      AND status = 'open'
    )
    OR
    engineer_id IN (
      SELECT id FROM engineers
      WHERE user_id = auth.uid()
    )
  );

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

-- Create policies for inspections
CREATE POLICY "Engineers can view their inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    engineer_id = auth.uid()
    OR
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
    EXISTS (
      SELECT 1 FROM engineers 
      WHERE id = auth.uid() 
      AND status = 'active'
    )
    AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.engineer_id = auth.uid()
      AND bookings.status = 'confirmed'
    )
  );

-- Create policies for inspection_photos
CREATE POLICY "Engineers can upload photos"
  ON inspection_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN engineers e ON e.id = i.engineer_id
      WHERE i.id = inspection_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "Users can view inspection photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN bookings b ON b.id = i.booking_id
      LEFT JOIN engineers e ON e.id = i.engineer_id
      WHERE i.id = inspection_id
      AND (
        b.user_id = auth.uid()
        OR 
        e.user_id = auth.uid()
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX idx_engineers_user_id ON engineers(user_id);
CREATE INDEX idx_engineer_requests_status ON engineer_requests(status);
CREATE INDEX idx_engineer_requests_email ON engineer_requests(email);
CREATE INDEX idx_engineer_requests_id_number ON engineer_requests(id_number);
CREATE INDEX idx_bookings_status_engineer ON bookings(status, engineer_id);
CREATE INDEX idx_bookings_user_id_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX idx_inspections_engineer_id ON inspections(engineer_id);
CREATE INDEX idx_inspections_booking_id ON inspections(booking_id);
CREATE INDEX idx_inspection_photos_inspection_id ON inspection_photos(inspection_id);

-- Create storage bucket for inspection photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-photos',
  'inspection-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Create storage policies with new names
CREATE POLICY "inspection_photos_upload_policy"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND EXISTS (
      SELECT 1 
      FROM engineers e 
      WHERE e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "inspection_photos_select_policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inspection-photos'
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create admin booking functions
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
  -- Check admin authorization
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create bookings';
  END IF;

  -- Validate date
  IF p_booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot book appointments in the past';
  END IF;

  -- Validate time (9 AM to 10 PM)
  IF EXTRACT(HOUR FROM p_booking_time) < 9 OR EXTRACT(HOUR FROM p_booking_time) >= 22 THEN
    RAISE EXCEPTION 'Booking time must be between 9 AM and 10 PM';
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

-- Create engineer response function
CREATE OR REPLACE FUNCTION handle_engineer_response(
  p_booking_id uuid,
  p_status text,
  p_rejection_reason_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_engineer_id uuid;
  v_response_id uuid;
BEGIN
  -- Get engineer ID
  SELECT id INTO v_engineer_id
  FROM engineers
  WHERE user_id = auth.uid()
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Engineer not found or inactive';
  END IF;

  -- Validate booking status
  IF NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE id = p_booking_id
    AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'Booking is not available';
  END IF;

  -- Check for existing response
  IF EXISTS (
    SELECT 1 FROM engineer_responses
    WHERE booking_id = p_booking_id
    AND engineer_id = v_engineer_id
  ) THEN
    RAISE EXCEPTION 'Already responded to this booking';
  END IF;

  -- Create response
  INSERT INTO engineer_responses (
    booking_id,
    engineer_id,
    status,
    rejection_reason_id,
    notes
  ) VALUES (
    p_booking_id,
    v_engineer_id,
    p_status,
    CASE WHEN p_status = 'rejected' THEN p_rejection_reason_id ELSE NULL END,
    p_notes
  )
  RETURNING id INTO v_response_id;

  -- If accepted, update booking status
  IF p_status = 'accepted' THEN
    UPDATE bookings
    SET 
      status = 'engineer_assigned',
      engineer_id = v_engineer_id
    WHERE id = p_booking_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'response_id', v_response_id,
    'booking_id', p_booking_id,
    'status', p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;