/*
  # Add foreign key relationships for bookings table

  1. Changes
    - Add foreign key constraint between bookings.package_id and packages.id
    - Add foreign key constraint between bookings.property_type_id and property_types.id

  2. Security
    - No changes to RLS policies
*/

DO $$ BEGIN
  -- Add foreign key for packages if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_package_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_package_id_fkey
    FOREIGN KEY (package_id) 
    REFERENCES packages(id)
    ON DELETE SET NULL;
  END IF;

  -- Add foreign key for property_types if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_property_type_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_property_type_id_fkey
    FOREIGN KEY (property_type_id) 
    REFERENCES property_types(id)
    ON DELETE SET NULL;
  END IF;
END $$;