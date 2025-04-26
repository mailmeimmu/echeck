-- Update inspection_photos table section constraint
ALTER TABLE inspection_photos DROP CONSTRAINT IF EXISTS valid_section;
ALTER TABLE inspection_photos ADD CONSTRAINT valid_section CHECK (
  section IN (
    'foundation_type',
    'foundation_condition',
    'wall_condition',
    'roof_condition'
  )
);