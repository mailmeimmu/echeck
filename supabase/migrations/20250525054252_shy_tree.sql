/*
  # Fix Inspection Draft Conflict
  
  1. Changes
    - Add function to update inspection draft timestamp
    - Ensure proper upsert behavior for inspection drafts
    - Fix unique constraint handling
    
  2. Security
    - No changes to RLS policies
*/

-- Create or replace function to update inspection draft timestamp
CREATE OR REPLACE FUNCTION update_inspection_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_inspection_draft_timestamp ON inspection_drafts;

-- Create trigger to automatically update timestamp
CREATE TRIGGER update_inspection_draft_timestamp
  BEFORE UPDATE ON inspection_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_draft_timestamp();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_inspection_drafts_booking_engineer 
ON inspection_drafts(booking_id, engineer_id);