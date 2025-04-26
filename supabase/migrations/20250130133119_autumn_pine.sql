-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Engineers can upload photos" ON inspection_photos;
DROP POLICY IF EXISTS "Engineers can view their photos" ON inspection_photos;
DROP POLICY IF EXISTS "Users can view inspection photos" ON inspection_photos;
DROP POLICY IF EXISTS "Allow engineer uploads to inspection-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow inspection photo access" ON storage.objects;

-- Create new inspection_photos policies with simplified checks
CREATE POLICY "Engineers can upload photos"
  ON inspection_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM engineers e
      WHERE e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "Users can view inspection photos"
  ON inspection_photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Create simplified storage policies
CREATE POLICY "Allow engineer uploads to inspection-photos"
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

CREATE POLICY "Allow inspection photo access"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inspection-photos'
  );

-- Ensure storage bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-photos',
  'inspection-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];