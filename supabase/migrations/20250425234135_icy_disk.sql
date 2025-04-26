/*
  # Fix Engineer Response Policies
  
  1. Changes
    - Drop existing policies before recreating
    - Add proper checks for engineer status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can create responses" ON engineer_responses;
DROP POLICY IF EXISTS "Engineers can view their responses" ON engineer_responses;

-- Create new policies
CREATE POLICY "Engineers can create responses"
  ON engineer_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM engineers
      WHERE id = engineer_responses.engineer_id
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
      WHERE id = engineer_responses.engineer_id
      AND user_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_engineer_responses_engineer_id 
ON engineer_responses(engineer_id);