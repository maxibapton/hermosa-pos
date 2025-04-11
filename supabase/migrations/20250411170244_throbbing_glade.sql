/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `isBulk` (boolean)
      - `defaultUnit` (text)
      - `defaultVatRate` (numeric)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for:
      - Anyone can read categories
      - Only staff and admin can create/update/delete categories
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  isBulk boolean DEFAULT false,
  defaultUnit text DEFAULT 'unit',
  defaultVatRate numeric DEFAULT 20.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  );

CREATE POLICY "Staff can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    (role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  )
  WITH CHECK (
    (role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  );

CREATE POLICY "Staff can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    (role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  );

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();