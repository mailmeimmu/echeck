/*
  # Add property types and update bookings table

  1. New Tables
    - `property_types` table for storing different types of properties
  
  2. Changes
    - Add property_type_id to bookings table
  
  3. Security
    - Enable RLS on property_types table
    - Add policy for reading property types
*/

-- Create property_types table
CREATE TABLE IF NOT EXISTS property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add property_type_id to existing bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_type_id uuid REFERENCES property_types(id);

-- Enable RLS
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

-- Property types policies
CREATE POLICY "Anyone can read property types"
  ON property_types
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert property types
INSERT INTO property_types (name) VALUES
  ('شقة'),
  ('فيلا'),
  ('عمارة'),
  ('أرض'),
  ('مجمع تجاري'),
  ('مستودع'),
  ('مكتب');