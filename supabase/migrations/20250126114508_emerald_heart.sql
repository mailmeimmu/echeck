/*
  # Create inspection system tables

  1. New Tables
    - inspections: Main inspection data
    - inspection_systems: Building systems details
    - inspection_safety: Safety features
    - inspection_notes: General notes and recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for engineer access
    - Ensure data integrity with constraints
*/

-- Create inspections table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspections') THEN
    CREATE TABLE inspections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id uuid REFERENCES bookings ON DELETE CASCADE,
      engineer_id uuid REFERENCES engineers ON DELETE CASCADE,
      property_age integer NOT NULL,
      total_area numeric NOT NULL,
      floor_count integer NOT NULL,
      foundation_type text NOT NULL,
      foundation_condition text NOT NULL,
      wall_condition text NOT NULL,
      roof_condition text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      CONSTRAINT valid_conditions CHECK (
        foundation_condition IN ('excellent', 'good', 'fair', 'poor', 'critical') AND
        wall_condition IN ('excellent', 'good', 'fair', 'poor', 'critical') AND
        roof_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')
      )
    );

    -- Enable RLS
    ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Engineers can view their inspections"
      ON inspections
      FOR SELECT
      TO authenticated
      USING (auth.uid() = engineer_id);

    CREATE POLICY "Engineers can create inspections"
      ON inspections
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = engineer_id AND
        EXISTS (
          SELECT 1 FROM engineers 
          WHERE id = auth.uid() AND status = 'active'
        )
      );
  END IF;
END $$;

-- Create inspection_systems table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_systems') THEN
    CREATE TABLE inspection_systems (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
      system_type text NOT NULL,
      condition text NOT NULL,
      details jsonb NOT NULL DEFAULT '{}',
      notes text,
      CONSTRAINT valid_system_type CHECK (
        system_type IN ('electrical', 'plumbing', 'hvac')
      ),
      CONSTRAINT valid_condition CHECK (
        condition IN ('excellent', 'good', 'fair', 'poor', 'critical')
      )
    );

    -- Enable RLS
    ALTER TABLE inspection_systems ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Engineers can view inspection systems"
      ON inspection_systems
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );

    CREATE POLICY "Engineers can create inspection systems"
      ON inspection_systems
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create inspection_safety table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_safety') THEN
    CREATE TABLE inspection_safety (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
      has_fire_alarms boolean NOT NULL DEFAULT false,
      has_sprinklers boolean NOT NULL DEFAULT false,
      has_fire_extinguishers boolean NOT NULL DEFAULT false,
      has_emergency_exits boolean NOT NULL DEFAULT false,
      notes text
    );

    -- Enable RLS
    ALTER TABLE inspection_safety ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Engineers can view inspection safety"
      ON inspection_safety
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );

    CREATE POLICY "Engineers can create inspection safety"
      ON inspection_safety
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create inspection_notes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspection_notes') THEN
    CREATE TABLE inspection_notes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
      general_notes text NOT NULL,
      recommendations text NOT NULL,
      urgent_issues text
    );

    -- Enable RLS
    ALTER TABLE inspection_notes ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Engineers can view inspection notes"
      ON inspection_notes
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );

    CREATE POLICY "Engineers can create inspection notes"
      ON inspection_notes
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM inspections
          WHERE inspections.id = inspection_id
          AND inspections.engineer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to inspections table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_inspections_updated_at'
  ) THEN
    CREATE TRIGGER update_inspections_updated_at
      BEFORE UPDATE ON inspections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;