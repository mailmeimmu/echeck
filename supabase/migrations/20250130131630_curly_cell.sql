-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can upload photos" ON inspection_photos;
DROP POLICY IF EXISTS "Anyone can view photos" ON inspection_photos;

-- Create new policies with proper checks
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

CREATE POLICY "Anyone can view photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure storage policies are correct
DO $$
BEGIN
  -- Drop existing storage policies
  DROP POLICY IF EXISTS "Engineers can upload inspection photos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view inspection photos" ON storage.objects;
  
  -- Create new storage policies
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

  CREATE POLICY "Anyone can view inspection photos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'inspection-photos');
END $$;