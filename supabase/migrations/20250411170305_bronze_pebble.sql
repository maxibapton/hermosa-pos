/*
  # Add categories table
  
  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `is_bulk` (boolean, default false)
      - `default_unit` (text)
      - `default_vat_rate` (numeric, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on categories table
    - Add policies for:
      - Staff can view all categories
      - Staff can create categories
      - Staff can update categories
  
  3. Triggers
    - Add updated_at trigger
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_bulk boolean DEFAULT false,
  default_unit text,
  default_vat_rate numeric DEFAULT 0 CHECK (default_vat_rate >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can view all categories"
  ON categories
  FOR SELECT
  TO public
  USING (role() = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "Staff can create categories"
  ON categories
  FOR INSERT
  TO public
  WITH CHECK (role() = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "Staff can update categories"
  ON categories
  FOR UPDATE
  TO public
  USING (role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  WITH CHECK (role() = ANY (ARRAY['admin'::text, 'staff'::text]));

-- Add updated_at trigger
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO categories (name, is_bulk, default_unit, default_vat_rate)
VALUES 
  ('General', false, 'piece', 0),
  ('Beverages', true, 'liter', 0),
  ('Food', false, 'piece', 0),
  ('Electronics', false, 'piece', 0),
  ('Stationery', false, 'piece', 0)
ON CONFLICT (id) DO NOTHING;