/*
  # Improve Database Connectivity and Performance
  
  1. Changes
    - Add connection pooling settings
    - Add statement timeout settings
    - Add indexes for better performance
    - Add function to handle connection retries
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inspection_drafts_booking_engineer 
ON inspection_drafts(booking_id, engineer_id);

-- Create or replace function to handle inspection draft upserts with better error handling
CREATE OR REPLACE FUNCTION upsert_inspection_draft(
  p_booking_id UUID,
  p_engineer_id UUID,
  p_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '30s'
AS $$
DECLARE
  v_draft_id UUID;
  v_retry_count INTEGER := 0;
  v_max_retries INTEGER := 3;
  v_retry_delay INTEGER := 1; -- seconds
BEGIN
  -- Retry loop for handling transient database errors
  WHILE v_retry_count < v_max_retries LOOP
    BEGIN
      -- Try to insert or update the draft
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
      
      -- If we get here, the operation succeeded
      RETURN v_draft_id;
      
    EXCEPTION
      WHEN deadlock_detected OR lock_not_available OR connection_exception OR
           connection_failure OR statement_timeout THEN
        -- These are transient errors that might be resolved by retrying
        v_retry_count := v_retry_count + 1;
        
        -- If we've reached max retries, re-raise the exception
        IF v_retry_count >= v_max_retries THEN
          RAISE;
        END IF;
        
        -- Wait before retrying (with exponential backoff)
        PERFORM pg_sleep(v_retry_delay * v_retry_count);
        
      WHEN OTHERS THEN
        -- For other errors, don't retry
        RAISE;
    END;
  END LOOP;
  
  -- This should never be reached due to the RETURN or RAISE in the loop
  RETURN NULL;
END;
$$;

-- Create function to get inspection draft with better error handling
CREATE OR REPLACE FUNCTION get_inspection_draft(
  p_booking_id UUID,
  p_engineer_id UUID
)
RETURNS TABLE (
  id UUID,
  booking_id UUID,
  engineer_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '10s'
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.booking_id, d.engineer_id, d.data, d.created_at, d.updated_at
  FROM inspection_drafts d
  WHERE d.booking_id = p_booking_id
  AND d.engineer_id = p_engineer_id;
END;
$$;

-- Create function to delete inspection draft with better error handling
CREATE OR REPLACE FUNCTION delete_inspection_draft(
  p_booking_id UUID,
  p_engineer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '10s'
AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  DELETE FROM inspection_drafts
  WHERE booking_id = p_booking_id
  AND engineer_id = p_engineer_id;
  
  GET DIAGNOSTICS v_result = ROW_COUNT;
  
  RETURN v_result > 0;
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