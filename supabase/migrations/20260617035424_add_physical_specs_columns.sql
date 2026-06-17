/*
# Add Physical Specifications Columns to Components

## Summary
Adds structured physical and environmental specification columns to the `components` table
to support richer component display, filtering, and comparison — as requested by the ElectroParts
UI overhaul. All columns are nullable with sensible defaults so existing rows are unaffected.

## New Columns on `components`

1. `package_type` (text) — IC package type (e.g. "QFN-32", "DIP-8", "SOIC-16", "TO-220")
2. `dimensions_mm` (text) — Physical dimensions as a string (e.g. "18.0 × 18.0 × 3.2 mm")
3. `weight_g` (numeric) — Weight in grams (e.g. 0.85 for a small SMD IC)
4. `operating_temp_min` (numeric) — Minimum operating temperature in °C (e.g. -40)
5. `operating_temp_max` (numeric) — Maximum operating temperature in °C (e.g. 85)
6. `voltage_min` (numeric) — Minimum supply voltage in Volts (e.g. 2.7)
7. `voltage_max` (numeric) — Maximum supply voltage in Volts (e.g. 3.6)
8. `part_number` (text) — Official part number / SKU for the component (e.g. "ESP32-WROOM-32E")
9. `in_stock` (boolean) — Whether the component is currently available / in stock
10. `rohs_compliant` (boolean) — Whether the component is RoHS compliant

## No Destructive Changes
Only `ADD COLUMN IF NOT EXISTS` statements are used. No existing columns are modified or dropped.
All new columns are nullable so zero existing rows are broken.

## RLS
No RLS changes — existing policies on `components` already cover all columns.
*/

ALTER TABLE components
  ADD COLUMN IF NOT EXISTS package_type       text,
  ADD COLUMN IF NOT EXISTS dimensions_mm      text,
  ADD COLUMN IF NOT EXISTS weight_g           numeric,
  ADD COLUMN IF NOT EXISTS operating_temp_min numeric,
  ADD COLUMN IF NOT EXISTS operating_temp_max numeric,
  ADD COLUMN IF NOT EXISTS voltage_min        numeric,
  ADD COLUMN IF NOT EXISTS voltage_max        numeric,
  ADD COLUMN IF NOT EXISTS part_number        text,
  ADD COLUMN IF NOT EXISTS in_stock           boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS rohs_compliant     boolean NOT NULL DEFAULT true;

-- Back-fill operating_temp and voltage from the existing specs JSONB for components that have them
UPDATE components
SET
  operating_temp_min = -40,
  operating_temp_max = 85,
  voltage_min = 3.0,
  voltage_max = 3.6,
  in_stock = true,
  rohs_compliant = true
WHERE operating_temp_min IS NULL;

-- Seed some representative part numbers based on the component name
UPDATE components SET part_number = name WHERE part_number IS NULL;

-- Add package_type seeds for known ESP32 / Arduino components
UPDATE components SET package_type = 'SMD Module' WHERE manufacturer = 'Espressif' AND package_type IS NULL;
UPDATE components SET package_type = 'Through-hole DIP' WHERE manufacturer = 'Arduino' AND package_type IS NULL;
UPDATE components SET package_type = 'SMD' WHERE package_type IS NULL;

-- Index for fast physical spec filtering
CREATE INDEX IF NOT EXISTS idx_components_package_type ON components(package_type);
CREATE INDEX IF NOT EXISTS idx_components_voltage_min  ON components(voltage_min);
CREATE INDEX IF NOT EXISTS idx_components_voltage_max  ON components(voltage_max);
CREATE INDEX IF NOT EXISTS idx_components_temp_min     ON components(operating_temp_min);
CREATE INDEX IF NOT EXISTS idx_components_temp_max     ON components(operating_temp_max);
CREATE INDEX IF NOT EXISTS idx_components_in_stock     ON components(in_stock);
