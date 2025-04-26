-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can upload photos" ON inspection_photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON inspection_photos;
DROP POLICY IF EXISTS "Engineers can upload inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;

-- Create new inspection_photos policies with proper user_id checks
CREATE POLICY "Engineers can upload photos"
  ON inspection_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM inspections i
      JOIN engineers e ON e.id = i.engineer_id
      WHERE i.id = inspection_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "Engineers can view their photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM inspections i
      LEFT JOIN engineers e ON e.id = i.engineer_id
      LEFT JOIN bookings b ON b.id = i.booking_id
      WHERE i.id = inspection_id
      AND (
        e.user_id = auth.uid() 
        OR b.user_id = auth.uid()
      )
    )
  );

-- Create storage policies with proper checks
CREATE POLICY "Engineers can upload inspection photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND EXISTS (
      SELECT 1 
      FROM engineers e 
      WHERE e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "Users can view their inspection photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inspection-photos'
    AND (
      -- Engineers can view photos they uploaded
      EXISTS (
        SELECT 1 
        FROM engineers e 
        WHERE e.user_id = auth.uid()
      )
      OR
      -- Users can view photos of their bookings
      EXISTS (
        SELECT 1
        FROM inspection_photos ip
        JOIN inspections i ON i.id = ip.inspection_id
        JOIN bookings b ON b.id = i.booking_id
        WHERE b.user_id = auth.uid()
      )
    )
  );