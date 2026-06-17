/*
# Electronics Component Comparison App Schema

## Overview
Creates the core tables for storing and comparing electronics components (microcontrollers, transistors, ICs, circuits, etc.)

## New Tables

### categories
- `id` (uuid, PK) — unique identifier
- `name` (text) — category name (e.g. "Microcontroller", "Transistor", "Sensor")
- `slug` (text, unique) — URL-friendly identifier
- `icon` (text) — icon name for display
- `description` (text) — short description of the category
- `created_at` (timestamptz)

### components
- `id` (uuid, PK) — unique identifier
- `name` (text) — component name (e.g. "ESP32-WROOM-32")
- `series` (text) — product series (e.g. "ESP32", "Arduino Uno", "RPi 4")
- `manufacturer` (text) — manufacturer name
- `category_id` (uuid, FK → categories) — component category
- `description` (text) — detailed description
- `image_url` (text) — optional product image
- `datasheet_url` (text) — optional datasheet link
- `specs` (jsonb) — flexible key-value specs storage
- `tags` (text[]) — searchable tags
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security
- RLS enabled on both tables
- Anon + authenticated users can read (public catalog)
- Anon + authenticated users can insert/update/delete (single-tenant, no auth required)
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'cpu',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  series text NOT NULL DEFAULT '',
  manufacturer text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  datasheet_url text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS components_category_id_idx ON components(category_id);
CREATE INDEX IF NOT EXISTS components_series_idx ON components(series);
CREATE INDEX IF NOT EXISTS components_tags_idx ON components USING GIN(tags);
CREATE INDEX IF NOT EXISTS components_specs_idx ON components USING GIN(specs);

ALTER TABLE components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_components" ON components;
CREATE POLICY "anon_select_components" ON components FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_components" ON components;
CREATE POLICY "anon_insert_components" ON components FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_components" ON components;
CREATE POLICY "anon_update_components" ON components FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_components" ON components;
CREATE POLICY "anon_delete_components" ON components FOR DELETE TO anon, authenticated USING (true);
