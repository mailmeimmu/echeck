/*
  # Add Inspection Tables

  1. New Tables
    - `inspections`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `engineer_id` (uuid, references engineers)
      - `property_age` (integer)
      - `total_area` (numeric)
      - `floor_count` (integer)
      - `foundation_type` (text)
      - `foundation_condition` (text)
      - `wall_condition` (text)
      - `roof_condition` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `inspection_systems`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid, references inspections)
      - `system_type` (text) - electrical, plumbing, hvac
      - `condition` (text)
      - `details` (jsonb)
      - `notes` (text)
    
    - `inspection_safety`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid, references inspections)
      - `has_fire_alarms` (boolean)
      - `has_sprinklers` (boolean)
      - `has_fire_extinguishers` (boolean)
      - `has_emergency_exits` (boolean)
      - `notes` (text)
    
    - `inspection_notes`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid, references inspections)
      - `general_notes` (text)
      - `recommendations` (text)
      - `urgent_issues` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for engineers to manage their inspections
*/

-- Create inspections table
CREATE TABLE inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers ON DELETE CASCADE,
  property_age integer NOT NULL,
  total_area numeric NOT NULL,
  floor_count integer NOT NULL,
  foundation_type text NOT NULL,
  foundation_condition text NOT NULL,
  wall_condition text NOT NULL,
  roof_condition text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_conditions CHECK (
    foundation_condition IN ('excellent', 'good', 'fair', 'poor', 'critical') AND
    wall_condition IN ('excellent', 'good', 'fair', 'poor', 'critical') AND
    roof_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')
  )
);

-- Create inspection_systems table
CREATE TABLE inspection_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  system_type text NOT NULL,
  condition text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  notes text,
  CONSTRAINT valid_system_type CHECK (
    system_type IN ('electrical', 'plumbing', 'hvac')
  ),
  CONSTRAINT valid_condition CHECK (
    condition IN ('excellent', 'good', 'fair', 'poor', 'critical')
  )
);

-- Create inspection_safety table
CREATE TABLE inspection_safety (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  has_fire_alarms boolean NOT NULL DEFAULT false,
  has_sprinklers boolean NOT NULL DEFAULT false,
  has_fire_extinguishers boolean NOT NULL DEFAULT false,
  has_emergency_exits boolean NOT NULL DEFAULT false,
  notes text
);

-- Create inspection_notes table
CREATE TABLE inspection_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  general_notes text NOT NULL,
  recommendations text NOT NULL,
  urgent_issues text
);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_notes ENABLE ROW LEVEL SECURITY;

-- Policies for inspections
CREATE POLICY "Engineers can view their inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = engineer_id);

CREATE POLICY "Engineers can create inspections"
  ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = engineer_id AND
    EXISTS (
      SELECT 1 FROM engineers 
      WHERE id = auth.uid() AND status = 'active'
    )
  );

-- Policies for inspection_systems
CREATE POLICY "Engineers can view inspection systems"
  ON inspection_systems
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can create inspection systems"
  ON inspection_systems
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

-- Policies for inspection_safety
CREATE POLICY "Engineers can view inspection safety"
  ON inspection_safety
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can create inspection safety"
  ON inspection_safety
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

-- Policies for inspection_notes
CREATE POLICY "Engineers can view inspection notes"
  ON inspection_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can create inspection notes"
  ON inspection_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to inspections table
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();