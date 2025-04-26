/*
  # Fix Engineer Requests Query
  
  1. Changes
    - Add index for better performance on status column
    - Update RLS policies for better access control
    - Add status constraint to ensure valid values
*/

-- Add index for status column
CREATE INDEX IF NOT EXISTS idx_engineer_requests_status 
ON engineer_requests(status);

-- Add status constraint
ALTER TABLE engineer_requests 
DROP CONSTRAINT IF EXISTS engineer_requests_status_check;

ALTER TABLE engineer_requests 
ADD CONSTRAINT engineer_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

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

CREATE POLICY "Admin can view engineer requests"
  ON engineer_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Enable RLS
ALTER TABLE engineer_requests ENABLE ROW LEVEL SECURITY;