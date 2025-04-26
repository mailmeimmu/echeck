/*
  # Inspection Schema Update
  
  1. Tables
    - inspections: Core inspection data
    - inspection_photos: Photo documentation
  
  2. Security
    - RLS policies with existence checks
    - Storage bucket policies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies for inspections if they exist
  DROP POLICY IF EXISTS "Engineers can create inspections" ON inspections;
  DROP POLICY IF EXISTS "Engineers can view their inspections" ON inspections;
  DROP POLICY IF EXISTS "Engineers can upload photos" ON inspection_photos;
  DROP POLICY IF EXISTS "Anyone can view photos" ON inspection_photos;
END $$;

-- Create or update inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers ON DELETE CASCADE,
  property_age integer NOT NULL,
  total_area numeric NOT NULL,
  floor_count integer NOT NULL,
  foundation_type text NOT NULL,
  foundation_condition text NOT NULL CHECK (foundation_condition IN ('excellent', 'good', 'fair', 'poor')),
  wall_condition text NOT NULL CHECK (wall_condition IN ('excellent', 'good', 'fair', 'poor')),
  roof_condition text NOT NULL CHECK (roof_condition IN ('excellent', 'good', 'fair', 'poor')),
  property_safe boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create or update inspection_photos table
CREATE TABLE IF NOT EXISTS inspection_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  url text NOT NULL,
  section text NOT NULL CHECK (
    section IN (
      'foundation_type',
      'foundation_condition',
      'wall_condition',
      'roof_condition'
    )
  ),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

-- Create new policies
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

CREATE POLICY "Engineers can upload photos"
  ON inspection_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('inspection-photos', 'inspection-photos', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Drop existing storage policies if they exist
  DROP POLICY IF EXISTS "Engineers can upload inspection photos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;
  
  -- Create new storage policies
  CREATE POLICY "Engineers can upload inspection photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'inspection-photos'
      AND EXISTS (
        SELECT 1 FROM engineers
        WHERE id = auth.uid()
        AND status = 'active'
      )
    );

  CREATE POLICY "Anyone can view inspection photos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'inspection-photos');
END $$;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_inspections_updated_at ON inspections;
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();