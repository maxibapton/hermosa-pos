/*
  # Stock Management and Alerts Schema

  1. New Tables
    - `stock_alerts`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `alert_type` (text) - 'low_stock' or 'out_of_stock'
      - `threshold` (integer)
      - `created_at` (timestamptz)
      - `notified_at` (timestamptz)

  2. Security
    - Enable RLS on `stock_alerts` table
    - Add policies for authenticated users to manage alerts
*/

-- Create stock alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
  threshold integer NOT NULL CHECK (threshold >= 0),
  created_at timestamptz DEFAULT now(),
  notified_at timestamptz,
  UNIQUE(product_id, alert_type)
);

-- Enable RLS
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can view stock alerts"
  ON stock_alerts
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "Staff can create stock alerts"
  ON stock_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

CREATE POLICY "Staff can update stock alerts"
  ON stock_alerts
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]))
  WITH CHECK ((auth.jwt() ->> 'role')::text = ANY (ARRAY['admin'::text, 'staff'::text]));

-- Create function to update notified_at timestamp
CREATE OR REPLACE FUNCTION update_stock_alert_notification()
RETURNS TRIGGER AS $$
BEGIN
  NEW.notified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update notified_at on update
CREATE TRIGGER update_stock_alert_notification_trigger
  BEFORE UPDATE ON stock_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_alert_notification();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_alert_type ON stock_alerts(alert_type);