/*
  # Add inspection drafts support
  
  1. New Tables
    - `inspection_drafts`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `engineer_id` (uuid, references engineers)
      - `data` (jsonb, stores form data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on inspection_drafts table
    - Add policies for engineers to manage their drafts
*/

CREATE TABLE IF NOT EXISTS inspection_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  engineer_id uuid REFERENCES engineers(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, engineer_id)
);

ALTER TABLE inspection_drafts ENABLE ROW LEVEL SECURITY;

-- Allow engineers to view their own drafts
CREATE POLICY "Engineers can view their drafts"
  ON inspection_drafts
  FOR SELECT
  TO authenticated
  USING (engineer_id IN (
    SELECT id FROM engineers WHERE user_id = auth.uid()
  ));

-- Allow engineers to create/update their drafts
CREATE POLICY "Engineers can manage their drafts"
  ON inspection_drafts
  FOR ALL
  TO authenticated
  USING (engineer_id IN (
    SELECT id FROM engineers WHERE user_id = auth.uid()
  ))
  WITH CHECK (engineer_id IN (
    SELECT id FROM engineers WHERE user_id = auth.uid()
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inspection_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp
CREATE TRIGGER update_inspection_draft_timestamp
  BEFORE UPDATE ON inspection_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_draft_timestamp();