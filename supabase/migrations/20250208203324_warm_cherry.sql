-- Create storage bucket for inspection photos if it doesn't exist
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

-- Update storage policies
DROP POLICY IF EXISTS "Allow engineer uploads to inspection-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow inspection photo access" ON storage.objects;

-- Create storage policies
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

-- Update inspection_photos table to ensure proper URL storage
ALTER TABLE inspection_photos
ALTER COLUMN url TYPE text,
ALTER COLUMN url SET NOT NULL;

-- Add index for faster photo queries
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection_id 
ON inspection_photos(inspection_id);