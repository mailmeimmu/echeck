/*
  # Add submit_inspection function
  
  1. New Functions
    - `submit_inspection`: Handles inspection submission with proper data processing
      - Takes booking_id, property_type, area, answers, photos, notes, and order_details
      - Validates engineer permissions and booking status
      - Creates inspection record and adds photos
      - Updates booking status to completed
      - Deletes draft after successful submission
  
  2. Security
    - Function is accessible to authenticated engineers only
    - Validates engineer is assigned to the booking
    - Ensures booking is in the correct status
*/

-- Create function to submit inspection
CREATE OR REPLACE FUNCTION submit_inspection(
  p_booking_id UUID,
  p_property_type TEXT,
  p_area TEXT,
  p_answers JSONB,
  p_photos JSONB,
  p_notes JSONB,
  p_order_details JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_engineer_id UUID;
  v_inspection_id UUID;
  v_booking_status TEXT;
  v_property_safe BOOLEAN;
  v_key TEXT;
  v_value JSONB;
  v_photo_url TEXT;
  v_section TEXT;
  v_i INTEGER;
BEGIN
  -- Get current user ID
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الحجز غير موجود أو غير مخصص لك';
  END IF;

  IF v_booking_status != 'in_progress' THEN
    RAISE EXCEPTION 'لا يمكن إضافة تقرير لحجز غير قيد الفحص';
  END IF;

  -- Determine if property is safe based on answers
  v_property_safe := TRUE; -- Default to safe
  
  -- Check for critical issues in foundation, walls, or roof
  IF (p_answers->'structure'->>'foundation_condition' = 'poor') OR
     (p_answers->'walls'->>'wall_condition' = 'poor') OR
     (p_answers->'roof'->>'roof_condition' = 'poor') THEN
    v_property_safe := FALSE;
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
    COALESCE((p_answers->'structure'->>'building_age')::INTEGER, 1),
    COALESCE((p_order_details->>'propertyArea')::NUMERIC, 100),
    COALESCE((p_answers->'structure'->>'number_of_floors')::INTEGER, 1),
    COALESCE(p_answers->'structure'->>'structure_type', 'concrete'),
    COALESCE(p_answers->'structure'->>'foundation_condition', 'good'),
    COALESCE(p_answers->'walls'->>'wall_condition', 'good'),
    COALESCE(p_answers->'roof'->>'roof_condition', 'good'),
    v_property_safe,
    p_order_details->>'notes'
  )
  RETURNING id INTO v_inspection_id;

  -- Add photos if any
  IF jsonb_typeof(p_photos) = 'object' THEN
    FOR v_key, v_value IN 
      SELECT * FROM jsonb_each(p_photos)
    LOOP
      IF jsonb_typeof(v_value) = 'array' AND jsonb_array_length(v_value) > 0 THEN
        FOR v_i IN 0..jsonb_array_length(v_value) - 1
        LOOP
          v_photo_url := jsonb_array_element_text(v_value, v_i);
          v_section := SPLIT_PART(v_key, '_', 1);
          
          INSERT INTO inspection_photos (
            inspection_id,
            url,
            section
          ) VALUES (
            v_inspection_id,
            v_photo_url,
            v_section
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;

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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'حدث خطأ أثناء حفظ التقرير: %', SQLERRM;
END;
$$;