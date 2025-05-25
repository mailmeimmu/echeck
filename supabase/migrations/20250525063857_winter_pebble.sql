/*
  # Add submit_inspection function
  
  1. New Functions
    - `submit_inspection`: Handles inspection submission with all related data
      - Takes booking_id, property_type, order_details, answers, photos, and notes
      - Updates booking status to completed
      - Creates inspection record with all data
      
  2. Security
    - Function is accessible to authenticated engineers only
    - Ensures proper validation and data integrity
*/

-- Create function to handle inspection submission
CREATE OR REPLACE FUNCTION submit_inspection(
  p_booking_id UUID,
  p_property_type TEXT,
  p_order_details JSONB,
  p_answers JSONB,
  p_photos JSONB,
  p_notes JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_engineer_id UUID;
  v_inspection_id UUID;
  v_booking_status TEXT;
BEGIN
  -- Get engineer ID
  SELECT id INTO v_engineer_id
  FROM engineers
  WHERE user_id = auth.uid()
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'المهندس غير موجود أو غير نشط';
  END IF;

  -- Check booking status
  SELECT status INTO v_booking_status
  FROM bookings
  WHERE id = p_booking_id
  AND engineer_id = v_engineer_id
  FOR UPDATE;

  IF v_booking_status IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود أو غير مخصص لك';
  END IF;

  IF v_booking_status != 'in_progress' THEN
    RAISE EXCEPTION 'لا يمكن إرسال تقرير لطلب غير قيد الفحص';
  END IF;

  -- Create inspection record
  INSERT INTO inspections (
    booking_id,
    engineer_id,
    property_age,
    total_area,
    floor_count,
    foundation_type,
    foundation_condition,
    wall_condition,
    roof_condition,
    property_safe,
    notes
  ) VALUES (
    p_booking_id,
    v_engineer_id,
    (p_order_details->>'propertyAge')::integer,
    (p_order_details->>'propertyArea')::numeric,
    1, -- Default floor count
    p_property_type,
    'good', -- Default values based on overall assessment
    'good',
    'good',
    true, -- Default to safe
    p_order_details->>'propertyDescription'
  )
  RETURNING id INTO v_inspection_id;

  -- Store full inspection data in jsonb format
  UPDATE inspections
  SET 
    data = jsonb_build_object(
      'property_type', p_property_type,
      'order_details', p_order_details,
      'answers', p_answers,
      'photos', p_photos,
      'notes', p_notes
    )
  WHERE id = v_inspection_id;

  -- Update booking status to completed
  UPDATE bookings
  SET status = 'completed'
  WHERE id = p_booking_id;

  -- Delete draft if exists
  DELETE FROM inspection_drafts
  WHERE booking_id = p_booking_id
  AND engineer_id = v_engineer_id;

  RETURN jsonb_build_object(
    'success', true,
    'inspection_id', v_inspection_id
  );
END;
$$;

-- Add data column to inspections table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspections' AND column_name = 'data'
  ) THEN
    ALTER TABLE inspections ADD COLUMN data JSONB;
  END IF;
END $$;