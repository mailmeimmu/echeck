/*
  # Add engineer authentication system

  1. New Tables
    - `engineer_requests`
      - `id` (uuid, primary key)
      - `id_number` (text, unique)
      - `phone_number` (text)
      - `message` (text)
      - `status` (text) - pending/approved/rejected
      - `created_at` (timestamptz)
    
    - `engineers`
      - `id` (uuid, primary key, references auth.users)
      - `id_number` (text, unique)
      - `phone_number` (text)
      - `status` (text) - active/inactive
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for engineers table
*/

-- Create engineer_requests table
CREATE TABLE engineer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_number text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create engineers table
CREATE TABLE engineers (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  id_number text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE engineer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;

-- Engineers policies
CREATE POLICY "Engineers can read own data"
  ON engineers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Engineer requests policies
CREATE POLICY "Anyone can insert engineer requests"
  ON engineer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);