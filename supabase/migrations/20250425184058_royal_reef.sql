/*
  # Delete All Users and Clean Database
  
  1. Changes
    - Delete all data from tables in correct order
    - Delete all auth users
    - Clean up storage objects
*/

-- Delete data in correct order to respect foreign key constraints
DELETE FROM inspection_photos;
DELETE FROM inspection_systems;
DELETE FROM inspection_safety;
DELETE FROM inspection_notes;
DELETE FROM inspection_tiles;
DELETE FROM inspection_walls;
DELETE FROM inspection_electrical;
DELETE FROM inspection_plumbing;
DELETE FROM inspection_doors;
DELETE FROM inspections;
DELETE FROM engineer_responses;
DELETE FROM bookings;
DELETE FROM engineer_requests;
DELETE FROM engineers;
DELETE FROM admin_users;
DELETE FROM profiles;

-- Delete storage objects
DELETE FROM storage.objects 
WHERE bucket_id = 'inspection-photos';

-- Delete existing auth users using a function to handle permissions
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