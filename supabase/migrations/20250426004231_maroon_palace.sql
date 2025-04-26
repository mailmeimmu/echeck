/*
  # Add phone number to bookings table

  1. Changes
    - Add `phone_number` column to `bookings` table
      - Type: text
      - Not nullable
      - Default: empty string
    - Add validation check for Saudi phone number format

  2. Notes
    - Phone numbers must start with '05' and be followed by 8 digits
    - Using DO block to safely add column if it doesn't exist
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN phone_number text NOT NULL DEFAULT '';

    ALTER TABLE bookings
    ADD CONSTRAINT valid_phone_number 
    CHECK (phone_number ~ '^05[0-9]{8}$');
  END IF;
END $$;