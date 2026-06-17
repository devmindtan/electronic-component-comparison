/*
# Add Physical & Availability Specs to Components

Adds 10 new columns to the components table for physical specs, temperature/voltage ratings,
availability status, and RoHS compliance. Also seeds existing rows with realistic defaults.

1. New Columns
- `package_type` (text) — IC package (e.g. SMD Module, TO-92, QFN-24)
- `dimensions_mm` (text) — physical size string (e.g. "18×18×3.2 mm")
- `weight_g` (numeric) — weight in grams
- `operating_temp_min` (numeric) — min operating temp in °C
- `operating_temp_max` (numeric) — max operating temp in °C
- `voltage_min` (numeric) — minimum supply voltage (V)
- `voltage_max` (numeric) — maximum supply voltage (V)
- `part_number` (text) — official part number / SKU
- `in_stock` (boolean, default true) — availability
- `rohs_compliant` (boolean, default true) — RoHS status

2. Indexes added for filter performance on package_type, in_stock, rohs_compliant
*/

ALTER TABLE components
  ADD COLUMN IF NOT EXISTS package_type text,
  ADD COLUMN IF NOT EXISTS dimensions_mm text,
  ADD COLUMN IF NOT EXISTS weight_g numeric,
  ADD COLUMN IF NOT EXISTS operating_temp_min numeric,
  ADD COLUMN IF NOT EXISTS operating_temp_max numeric,
  ADD COLUMN IF NOT EXISTS voltage_min numeric,
  ADD COLUMN IF NOT EXISTS voltage_max numeric,
  ADD COLUMN IF NOT EXISTS part_number text,
  ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS rohs_compliant boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS components_package_type_idx ON components(package_type);
CREATE INDEX IF NOT EXISTS components_in_stock_idx ON components(in_stock);

-- Seed physical data for existing components
UPDATE components SET
  part_number = name,
  operating_temp_min = -40,
  operating_temp_max = 85,
  in_stock = true,
  rohs_compliant = true
WHERE part_number IS NULL;

-- ESP32 variants
UPDATE components SET package_type = 'SMD Module', dimensions_mm = '18×20×3.2 mm', weight_g = 2.0, voltage_min = 3.0, voltage_max = 3.6
WHERE name LIKE 'ESP32%';

UPDATE components SET package_type = 'SMD Module', dimensions_mm = '18×20×3.2 mm', weight_g = 2.0, voltage_min = 3.0, voltage_max = 3.6
WHERE name = 'ESP8266';

-- Arduino
UPDATE components SET package_type = 'PCB Board', dimensions_mm = '68.6×53.4 mm', weight_g = 25.0, voltage_min = 5.0, voltage_max = 5.0, operating_temp_min = -40, operating_temp_max = 85
WHERE name LIKE 'Arduino Uno%';

UPDATE components SET package_type = 'PCB Board', dimensions_mm = '18×45 mm', weight_g = 7.0, voltage_min = 5.0, voltage_max = 5.0
WHERE name LIKE 'Arduino Nano%';

UPDATE components SET package_type = 'PCB Board', dimensions_mm = '101.6×53.3 mm', weight_g = 37.0, voltage_min = 5.0, voltage_max = 5.0
WHERE name LIKE 'Arduino Mega%';

-- STM32
UPDATE components SET package_type = 'LQFP-48', dimensions_mm = '7×7 mm', weight_g = 0.3, voltage_min = 2.0, voltage_max = 3.6
WHERE name LIKE '%Blue Pill%' OR name LIKE '%STM32F103%';

UPDATE components SET package_type = 'PCB Board', dimensions_mm = '65×50 mm', weight_g = 20.0, voltage_min = 3.0, voltage_max = 5.0
WHERE name LIKE '%F4 Discovery%';

-- Raspberry Pi
UPDATE components SET package_type = 'PCB Board', dimensions_mm = '85×56 mm', weight_g = 46.0, voltage_min = 5.0, voltage_max = 5.0, operating_temp_min = 0, operating_temp_max = 50
WHERE name LIKE 'Raspberry Pi 4%';

UPDATE components SET package_type = 'PCB Board', dimensions_mm = '65×30 mm', weight_g = 9.0, voltage_min = 5.0, voltage_max = 5.0, operating_temp_min = 0, operating_temp_max = 50
WHERE name LIKE 'Raspberry Pi Zero%';

UPDATE components SET package_type = 'PCB Board', dimensions_mm = '51×21 mm', weight_g = 3.0, voltage_min = 1.8, voltage_max = 5.5, operating_temp_min = -20, operating_temp_max = 70
WHERE name LIKE 'Raspberry Pi Pico%';

-- Transistors
UPDATE components SET package_type = 'TO-92', dimensions_mm = '5.3×5.1 mm', weight_g = 0.1, voltage_min = 5.0, voltage_max = 40.0, operating_temp_min = -55, operating_temp_max = 150
WHERE name = '2N2222A';

UPDATE components SET package_type = 'TO-92', dimensions_mm = '5.3×5.1 mm', weight_g = 0.1, voltage_min = 5.0, voltage_max = 45.0, operating_temp_min = -65, operating_temp_max = 150
WHERE name = 'BC547';

UPDATE components SET package_type = 'TO-220AB', dimensions_mm = '15.9×10.4 mm', weight_g = 1.8, voltage_min = 10.0, voltage_max = 100.0, operating_temp_min = -55, operating_temp_max = 175
WHERE name = 'IRF540N';

-- Sensors
UPDATE components SET package_type = '4-pin DIP', dimensions_mm = '15.1×25 mm', weight_g = 2.0, voltage_min = 3.3, voltage_max = 6.0, operating_temp_min = -40, operating_temp_max = 80
WHERE name = 'DHT22';

UPDATE components SET package_type = 'QFN-24', dimensions_mm = '4×4×0.9 mm', weight_g = 0.05, voltage_min = 3.3, voltage_max = 3.3, operating_temp_min = -40, operating_temp_max = 85
WHERE name = 'MPU-6050';
