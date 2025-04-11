/*
  # Categories Schema Update

  1. Table Updates
    - Add default_vat_rate to categories
    - Add updated_at column and trigger
  
  2. Security
    - Add staff-specific policies with unique names
  
  3. Data
    - Insert default category records
*/

-- Update categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS default_vat_rate numeric DEFAULT 0 CHECK (default_vat_rate >= 0),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create policies with unique names
CREATE POLICY "categories_staff_view_20250411" 
  ON categories
  FOR SELECT
  TO public
  USING ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "categories_staff_insert_20250411" 
  ON categories
  FOR INSERT
  TO public
  WITH CHECK ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "categories_staff_update_20250411" 
  ON categories
  FOR UPDATE
  TO public
  USING ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]))
  WITH CHECK ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

-- Add updated_at trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO categories (name, is_bulk, default_unit, default_vat_rate)
VALUES 
  ('General', false, 'piece', 0),
  ('Beverages', true, 'liter', 0),
  ('Food', false, 'piece', 0),
  ('Electronics', false, 'piece', 0),
  ('Stationery', false, 'piece', 0)
ON CONFLICT (name) DO NOTHING;