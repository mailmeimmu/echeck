/*
  # Add location and notes to bookings

  1. Changes
    - Add `location` column to bookings table (required)
    - Add `notes` column to bookings table (optional)
*/

ALTER TABLE bookings
ADD COLUMN location text NOT NULL DEFAULT '',
ADD COLUMN notes text;