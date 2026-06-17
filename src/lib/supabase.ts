import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  created_at: string;
};

export type Component = {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  category_id: string | null;
  description: string;
  image_url: string;
  datasheet_url: string;
  specs: Record<string, unknown>;
  tags: string[];
  package_type: string | null;
  dimensions_mm: string | null;
  weight_g: number | null;
  operating_temp_min: number | null;
  operating_temp_max: number | null;
  voltage_min: number | null;
  voltage_max: number | null;
  part_number: string | null;
  in_stock: boolean;
  rohs_compliant: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
};
