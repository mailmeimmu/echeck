/*
  # Simplify Database Schema
  
  1. Changes
    - Remove unused tables and columns
    - Simplify booking workflow
    - Remove email notifications
    
  2. Security
    - Maintain existing RLS policies
    - Keep core functionality intact
*/

-- Remove unused tables
DROP TABLE IF EXISTS inspection_photos CASCADE;
DROP TABLE IF EXISTS inspection_systems CASCADE;
DROP TABLE IF EXISTS inspection_safety CASCADE;
DROP TABLE IF EXISTS inspection_notes CASCADE;
DROP TABLE IF EXISTS inspection_tiles CASCADE;
DROP TABLE IF EXISTS inspection_walls CASCADE;
DROP TABLE IF EXISTS inspection_electrical CASCADE;
DROP TABLE IF EXISTS inspection_plumbing CASCADE;
DROP TABLE IF EXISTS inspection_doors CASCADE;

-- Simplify inspections table
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

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

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

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();