/*
  # Categories Table Schema

  1. Table Structure
    - `id` (uuid, primary key)
    - `name` (text, unique, not null)
    - `isBulk` (boolean, default false)
    - `defaultUnit` (text, default 'unit')
    - `defaultVatRate` (numeric, default 20.0)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access
    - Staff-only write access
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
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text])
  );

CREATE POLICY "Staff can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text])
  )
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text])
  );

CREATE POLICY "Staff can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text])
  );

-- Create trigger for updating the updated_at timestamp
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();