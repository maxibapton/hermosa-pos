/*
  # Initial Schema Setup

  1. Extensions
    - Enable UUID extension for ID generation

  2. Tables
    - products
    - categories
    - stores

  3. Security
    - Enable RLS on all tables
    - Add read access policies
    - Create updated_at trigger function
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  is_bulk boolean DEFAULT false,
  default_unit text,
  created_at timestamptz DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  vat_number text,
  currency text DEFAULT 'EUR',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "products_public_read" 
  ON products 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "categories_public_read" 
  ON categories 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "stores_public_read" 
  ON stores 
  FOR SELECT 
  TO public 
  USING (true);