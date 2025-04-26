/*
  # Delete All Users and Clean Database
  
  1. Changes
    - Safely delete all data by checking table existence
    - Delete all auth users
    - Clean up storage objects
*/

-- Delete data in correct order to respect foreign key constraints
DO $$ 
BEGIN
  -- Delete inspection related data if tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_photos') THEN
    DELETE FROM inspection_photos;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_systems') THEN
    DELETE FROM inspection_systems;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_safety') THEN
    DELETE FROM inspection_safety;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_notes') THEN
    DELETE FROM inspection_notes;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_tiles') THEN
    DELETE FROM inspection_tiles;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_walls') THEN
    DELETE FROM inspection_walls;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_electrical') THEN
    DELETE FROM inspection_electrical;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_plumbing') THEN
    DELETE FROM inspection_plumbing;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_doors') THEN
    DELETE FROM inspection_doors;
  END IF;

  -- Delete core data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspections') THEN
    DELETE FROM inspections;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engineer_responses') THEN
    DELETE FROM engineer_responses;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    DELETE FROM bookings;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engineer_requests') THEN
    DELETE FROM engineer_requests;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engineers') THEN
    DELETE FROM engineers;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    DELETE FROM admin_users;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DELETE FROM profiles;
  END IF;
END $$;

-- Delete storage objects if bucket exists
DELETE FROM storage.objects 
WHERE bucket_id = 'inspection-photos';

-- Delete auth users using a function
CREATE OR REPLACE FUNCTION delete_all_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to delete users
SELECT delete_all_users();

-- Drop the function after use
DROP FUNCTION IF EXISTS delete_all_users();