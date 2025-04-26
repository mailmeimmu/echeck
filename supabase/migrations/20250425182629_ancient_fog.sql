/*
  # Update Email Domains
  
  1. Changes
    - Update admin_users email constraint to use @yopmail.com
    - Delete existing users
    - Create new admin and engineer users with @yopmail.com emails
*/

-- Delete existing data to start fresh
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

-- Update admin_users table constraint to use @yopmail.com
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_email_check;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_email_check 
CHECK ((email LIKE '%@yopmail.com') AND (email NOT LIKE 'engineer@%'));

DO $$ 
DECLARE
  admin_user_id uuid;
  engineer_user_id uuid;
BEGIN
  -- Create platform admin user with new email domain
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'acheck@yopmail.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"مدير النظام"}',
    false,
    'authenticated'
  ) RETURNING id INTO admin_user_id;

  -- Create admin profile
  INSERT INTO profiles (
    id,
    email,
    first_name,
    created_at,
    updated_at,
    email_verified
  ) VALUES (
    admin_user_id,
    'acheck@yopmail.com',
    'مدير النظام',
    now(),
    now(),
    true
  );

  -- Create admin user record
  INSERT INTO admin_users (
    id,
    email,
    created_at
  ) VALUES (
    admin_user_id,
    'acheck@yopmail.com',
    now()
  );

  -- Create engineer user with new email domain
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    'echeck@yopmail.com',
    crypt('engineer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"أحمد المهندس"}',
    false,
    'authenticated'
  ) RETURNING id INTO engineer_user_id;

  -- Create engineer profile
  INSERT INTO profiles (
    id,
    email,
    first_name,
    created_at,
    updated_at,
    email_verified
  ) VALUES (
    engineer_user_id,
    'echeck@yopmail.com',
    'أحمد المهندس',
    now(),
    now(),
    true
  );

  -- Create engineer record
  INSERT INTO engineers (
    id,
    user_id,
    id_number,
    phone_number,
    status,
    created_at
  ) VALUES (
    engineer_user_id,
    engineer_user_id,
    '1234567890',
    '0500000000',
    'active',
    now()
  );
END $$;