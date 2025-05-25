/*
  # Clean Database and Create Example Users
  
  1. Changes
    - Delete all existing data
    - Create example admin user with @admin.check.sa domain
    - Create example engineer user with @check.sa domain
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

-- Create platform admin user
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
  '00000000-0000-0000-0000-000000000001',
  'admin@admin.check.sa',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"مدير النظام"}',
  false,
  'authenticated'
);

-- Create admin profile
INSERT INTO profiles (
  id,
  email,
  first_name,
  created_at,
  updated_at,
  email_verified
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@admin.check.sa',
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
  '00000000-0000-0000-0000-000000000001',
  'admin@admin.check.sa',
  now()
);

-- Create engineer user
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
  '00000000-0000-0000-0000-000000000002',
  'engineer@check.sa',
  crypt('engineer123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"أحمد المهندس"}',
  false,
  'authenticated'
);

-- Create engineer profile
INSERT INTO profiles (
  id,
  email,
  first_name,
  created_at,
  updated_at,
  email_verified
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'engineer@check.sa',
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
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '1234567890',
  '0500000000',
  'active',
  now()
);