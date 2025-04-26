/*
  # Add email field to engineer_requests table

  1. Changes
    - Add email column to engineer_requests table
    - Add unique constraint on email
    - Update RLS policies for engineer requests

  2. Security
    - Maintain existing RLS policies
    - Add email uniqueness check
*/

-- Add email column with a default value first
ALTER TABLE engineer_requests ADD COLUMN email text;

-- Update any existing rows with a default value
UPDATE engineer_requests SET email = 'no-email@example.com';

-- Now make it NOT NULL
ALTER TABLE engineer_requests ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE engineer_requests ADD CONSTRAINT engineer_requests_email_unique UNIQUE (email);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can insert engineer requests" ON engineer_requests;

-- Create new policy with email check
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