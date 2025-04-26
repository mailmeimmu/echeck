/*
  # Add Sample Bookings for Testing
  
  1. Changes
    - Add sample bookings with different statuses
    - Add proper relationships to packages and property types
*/

-- Insert sample packages if they don't exist
INSERT INTO packages (id, name, price, features_count, description)
SELECT 
  gen_random_uuid(), 'الباقة البلاتينية', 2200, 12,
  'فحص شامل للعقار مع تقرير مفصل وتوصيات متخصصة'
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'الباقة البلاتينية'
);

INSERT INTO packages (id, name, price, features_count, description)
SELECT 
  gen_random_uuid(), 'الباقة الذهبية', 1500, 8,
  'فحص متكامل للعقار مع تقرير تفصيلي'
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'الباقة الذهبية'
);

-- Insert sample property types if they don't exist
INSERT INTO property_types (id, name)
SELECT gen_random_uuid(), 'فيلا'
WHERE NOT EXISTS (
  SELECT 1 FROM property_types WHERE name = 'فيلا'
);

INSERT INTO property_types (id, name)
SELECT gen_random_uuid(), 'شقة'
WHERE NOT EXISTS (
  SELECT 1 FROM property_types WHERE name = 'شقة'
);

-- Create sample bookings
DO $$ 
DECLARE
  v_package_id uuid;
  v_property_type_id uuid;
  v_engineer_id uuid;
BEGIN
  -- Get a package ID
  SELECT id INTO v_package_id FROM packages LIMIT 1;
  
  -- Get a property type ID
  SELECT id INTO v_property_type_id FROM property_types LIMIT 1;
  
  -- Get an engineer ID
  SELECT id INTO v_engineer_id FROM engineers LIMIT 1;

  -- Insert pending booking
  INSERT INTO bookings (
    package_id,
    property_type_id,
    status,
    location,
    booking_date,
    booking_time,
    phone_number,
    notes
  ) VALUES (
    v_package_id,
    v_property_type_id,
    'pending',
    'حي النرجس، الرياض',
    CURRENT_DATE + interval '2 days',
    '14:00:00',
    '0500000001',
    'فحص شامل للفيلا قبل الشراء'
  );

  -- Insert open booking
  INSERT INTO bookings (
    package_id,
    property_type_id,
    status,
    location,
    booking_date,
    booking_time,
    phone_number,
    notes
  ) VALUES (
    v_package_id,
    v_property_type_id,
    'open',
    'حي الملقا، الرياض',
    CURRENT_DATE + interval '3 days',
    '10:00:00',
    '0500000002',
    'فحص الأساسات والعزل'
  );

  -- Insert engineer_assigned booking
  INSERT INTO bookings (
    package_id,
    property_type_id,
    status,
    location,
    booking_date,
    booking_time,
    phone_number,
    notes,
    engineer_id
  ) VALUES (
    v_package_id,
    v_property_type_id,
    'engineer_assigned',
    'حي العليا، الرياض',
    CURRENT_DATE + interval '4 days',
    '16:00:00',
    '0500000003',
    'فحص شامل للشقة',
    v_engineer_id
  );

  -- Insert in_progress booking
  INSERT INTO bookings (
    package_id,
    property_type_id,
    status,
    location,
    booking_date,
    booking_time,
    phone_number,
    notes,
    engineer_id
  ) VALUES (
    v_package_id,
    v_property_type_id,
    'in_progress',
    'حي الياسمين، الرياض',
    CURRENT_DATE + interval '1 day',
    '09:00:00',
    '0500000004',
    'فحص دوري للعقار',
    v_engineer_id
  );
END $$;