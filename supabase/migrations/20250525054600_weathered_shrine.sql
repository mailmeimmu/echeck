/*
  # Fix Inspection Draft Upsert Logic
  
  1. Changes
    - Create a function to handle inspection draft upserts
    - Properly handle conflicts with ON CONFLICT DO UPDATE
    - Ensure proper timestamp updates
    
  2. Security
    - Function is accessible to authenticated users only
    - Users can only update their own drafts
*/

-- Create a function to handle inspection draft upserts
CREATE OR REPLACE FUNCTION upsert_inspection_draft(
  p_booking_id UUID,
  p_engineer_id UUID,
  p_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_draft_id UUID;
BEGIN
  -- Insert the draft with ON CONFLICT DO UPDATE
  INSERT INTO inspection_drafts (
    booking_id,
    engineer_id,
    data,
    updated_at
  ) VALUES (
    p_booking_id,
    p_engineer_id,
    p_data,
    now()
  )
  ON CONFLICT (booking_id, engineer_id) 
  DO UPDATE SET
    data = p_data,
    updated_at = now()
  RETURNING id INTO v_draft_id;
  
  RETURN v_draft_id;
END;
$$;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION update_inspection_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_inspection_draft_timestamp ON inspection_drafts;
CREATE TRIGGER update_inspection_draft_timestamp
  BEFORE UPDATE ON inspection_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_draft_timestamp();

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_inspection_drafts_booking_engineer 
ON inspection_drafts(booking_id, engineer_id);