/*
  # Update Inspection Schema for Detailed Property Inspection

  1. New Tables
    - `inspection_tiles`: Detailed tile inspection data
    - `inspection_walls`: Wall and facade inspection data
    - `inspection_electrical`: Electrical system inspection data
    - `inspection_plumbing`: Plumbing system inspection data
    - `inspection_doors`: Door inspection data

  2. Changes
    - Add new inspection categories
    - Add rating scales for each category
    - Support photo documentation for each item
*/

-- Create inspection_tiles table
CREATE TABLE inspection_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  tile_type text NOT NULL CHECK (tile_type IN ('porcelain', 'marble', 'ceramic', 'other')),
  has_hollow_spots boolean,
  levelness_good boolean,
  slope_good boolean,
  slip_resistant boolean,
  skirting_good boolean,
  expansion_joints_good boolean,
  rating integer CHECK (rating BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create inspection_walls table
CREATE TABLE inspection_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  condition_good boolean,
  has_cracks boolean,
  paint_good boolean,
  has_water_damage boolean,
  rating integer CHECK (rating BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create inspection_electrical table
CREATE TABLE inspection_electrical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  meter_working boolean,
  switches_quality_good boolean,
  switches_operation_good boolean,
  lighting_distribution_good boolean,
  switch_locations_good boolean,
  socket_locations_good boolean,
  bulb_type_good boolean,
  voltage_type text CHECK (voltage_type IN ('220', '110', '380', 'other')),
  meter_connections_good boolean,
  outdoor_sockets_protected boolean,
  garden_wiring_installed boolean,
  rating integer CHECK (rating BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create inspection_plumbing table
CREATE TABLE inspection_plumbing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  water_meter_working boolean,
  garden_plumbing_installed boolean,
  drains_good boolean,
  rain_gutters_installed boolean,
  tank_covers_quality_good boolean,
  rating integer CHECK (rating BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create inspection_doors table
CREATE TABLE inspection_doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections ON DELETE CASCADE,
  exterior_door_type text CHECK (
    exterior_door_type IN (
      'stainless_steel',
      'cladding',
      'glass',
      'steel',
      'other'
    )
  ),
  garage_door_type text CHECK (
    garage_door_type IN (
      'roll',
      'stainless_steel',
      'cladding',
      'glass',
      'steel',
      'other'
    )
  ),
  smooth_operation boolean,
  hardware_good boolean,
  door_stoppers_installed boolean,
  weight_balance_good boolean,
  rating integer CHECK (rating BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inspection_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_electrical ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_plumbing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_doors ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Engineers can manage their inspection data"
  ON inspection_tiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_id
      AND i.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can manage their inspection data"
  ON inspection_walls
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_id
      AND i.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can manage their inspection data"
  ON inspection_electrical
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_id
      AND i.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can manage their inspection data"
  ON inspection_plumbing
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_id
      AND i.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can manage their inspection data"
  ON inspection_doors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.id = inspection_id
      AND i.engineer_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_inspection_tiles_inspection_id ON inspection_tiles(inspection_id);
CREATE INDEX idx_inspection_walls_inspection_id ON inspection_walls(inspection_id);
CREATE INDEX idx_inspection_electrical_inspection_id ON inspection_electrical(inspection_id);
CREATE INDEX idx_inspection_plumbing_inspection_id ON inspection_plumbing(inspection_id);
CREATE INDEX idx_inspection_doors_inspection_id ON inspection_doors(inspection_id);