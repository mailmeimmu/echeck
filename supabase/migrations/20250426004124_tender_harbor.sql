/*
  # Add package and property type relationships to bookings
  
  1. Changes
    - Add package_id and property_type_id columns
    - Add foreign key constraints
  
  2. Security
    - No changes to RLS policies
*/

DO $$ 
BEGIN
  -- Add package_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'package_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN package_id uuid REFERENCES packages(id);
  END IF;

  -- Add property_type_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'property_type_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN property_type_id uuid REFERENCES property_types(id);
  END IF;

  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_package_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_package_id_fkey
    FOREIGN KEY (package_id) REFERENCES packages(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_property_type_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_property_type_id_fkey
    FOREIGN KEY (property_type_id) REFERENCES property_types(id);
  END IF;
END $$;