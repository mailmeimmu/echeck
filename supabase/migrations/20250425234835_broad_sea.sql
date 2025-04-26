/*
  # Fix Engineer Request Visibility
  
  1. Changes
    - Update policies to allow engineers to view open requests
    - Add proper status checks
    - Improve query performance with indexes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert engineer requests" ON engineer_requests;
DROP POLICY IF EXISTS "Admin can view engineer requests" ON engineer_requests;

-- Create new policies
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

CREATE POLICY "Engineers can view open requests"
  ON engineer_requests
  FOR SELECT
  TO authenticated
  USING (
    status = 'open'
    AND EXISTS (
      SELECT 1 FROM engineers
      WHERE user_id = auth.uid()
      AND status = 'active'
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_engineer_requests_status 
ON engineer_requests(status);

CREATE INDEX IF NOT EXISTS idx_engineer_requests_email 
ON engineer_requests(email);

CREATE INDEX IF NOT EXISTS idx_engineer_requests_id_number 
ON engineer_requests(id_number);