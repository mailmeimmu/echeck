/*
  # Add property types and update bookings table

  1. Changes
    - Create property_types table if not exists
    - Add property_type_id to bookings table
    - Add required columns to bookings table
    - Add time range constraint
  
  2. Security
    - Enable RLS on property_types
    - Add read policy for property types
*/

-- Create property_types table
CREATE TABLE IF NOT EXISTS property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to bookings table
DO $$ 
BEGIN
  -- Add property_type_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'property_type_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN property_type_id uuid REFERENCES property_types(id);
  END IF;

  -- Add phone_number if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE bookings ADD COLUMN phone_number text NOT NULL DEFAULT '';
  END IF;

  -- Add booking_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add booking_time if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_time'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_time time NOT NULL DEFAULT '09:00:00';
  END IF;

  -- Add location if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'location'
  ) THEN
    ALTER TABLE bookings ADD COLUMN location text NOT NULL DEFAULT '';
  END IF;

  -- Add notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'notes'
  ) THEN
    ALTER TABLE bookings ADD COLUMN notes text;
  END IF;
END $$;

-- Add time range constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'bookings' AND constraint_name = 'valid_time_range'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT valid_time_range 
    CHECK (
      EXTRACT(HOUR FROM booking_time) >= 9 AND 
      EXTRACT(HOUR FROM booking_time) < 22
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

-- Property types policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_types' AND policyname = 'Anyone can read property types'
  ) THEN
    CREATE POLICY "Anyone can read property types"
      ON property_types
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Insert property types if they don't exist
INSERT INTO property_types (name)
SELECT unnest(ARRAY[
  'شقة',
  'فيلا',
  'عمارة',
  'أرض',
  'مجمع تجاري',
  'مستودع',
  'مكتب'
])
WHERE NOT EXISTS (
  SELECT 1 FROM property_types
);