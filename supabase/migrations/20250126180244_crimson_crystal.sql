/*
  # Add Inspection Photos Support

  1. New Tables
    - `inspection_photos`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid, references inspections)
      - `url` (text, photo URL)
      - `description` (text, optional)
      - `section` (text, which section the photo belongs to)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `inspection_photos` table
    - Add policies for engineers to manage photos
*/

-- Create inspection_photos table
CREATE TABLE inspection_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  url text NOT NULL,
  description text,
  section text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_section CHECK (
    section IN (
      'exterior',
      'interior',
      'structural',
      'electrical',
      'plumbing',
      'hvac',
      'safety'
    )
  )
);

-- Enable RLS
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Engineers can view inspection photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can insert inspection photos"
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

CREATE POLICY "Engineers can delete their photos"
  ON inspection_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_id
      AND inspections.engineer_id = auth.uid()
    )
  );