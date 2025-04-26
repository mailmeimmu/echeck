/*
  # Create packages and bookings tables

  1. New Tables
    - `packages`
      - `id` (uuid, primary key)
      - `name` (text) - Package name in Arabic
      - `price` (integer) - Price in SAR
      - `features_count` (integer) - Number of features
      - `description` (text) - Package description in Arabic
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `package_id` (uuid, references packages)
      - `status` (text) - Booking status (pending, confirmed, completed)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for reading packages
    - Add policies for managing bookings
*/

-- Create packages table
CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL,
  features_count integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Packages policies
CREATE POLICY "Anyone can read packages"
  ON packages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert package data
INSERT INTO packages (name, price, features_count, description) VALUES
  ('بلاتينية', 2200, 12, 'الباقة البلاتينية تشمل فحص شامل للعقار مع 12 خدمة متخصصة من قبل مهندسينا المحترفين'),
  ('ذهبية', 1500, 8, 'الباقة الذهبية تشمل فحص متكامل للعقار مع 8 خدمات أساسية من قبل مهندسينا المؤهلين'),
  ('فضية', 800, 4, 'الباقة الفضية تشمل الفحص الأساسي للعقار مع 4 خدمات رئيسية من قبل مهندسينا المعتمدين');