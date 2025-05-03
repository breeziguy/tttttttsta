/*
  # Create subscription plans table with staff access percentage

  1. New Tables
    - subscription_plans
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - price (numeric)
      - features (jsonb[])
      - staff_access_percentage (integer)
      - duration_days (integer)
      - max_staff_selections (integer)
      - allow_pdf_download (boolean)
      - is_one_time (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on subscription_plans table
    - Add policies for public read access
    - Add policies for admin write access

  3. Data
    - Insert initial subscription plans with staff access percentages
*/

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  features jsonb[] NOT NULL DEFAULT '{}',
  staff_access_percentage integer NOT NULL DEFAULT 100,
  duration_days integer NOT NULL DEFAULT 30,
  max_staff_selections integer NOT NULL DEFAULT 1,
  allow_pdf_download boolean NOT NULL DEFAULT false,
  is_one_time boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access to subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER set_timestamp_subscription_plans
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert subscription plans
INSERT INTO subscription_plans (
  name,
  description,
  price,
  features,
  staff_access_percentage,
  max_staff_selections,
  allow_pdf_download
) VALUES
(
  'Essential Plan',
  'Perfect for individuals seeking reliable domestic staff with essential support.',
  12000,
  ARRAY[
    '{"feature": "Access to verified staff profiles", "included": true}',
    '{"feature": "Self-service booking system", "included": true}',
    '{"feature": "24-hour replacement guarantee", "included": true}',
    '{"feature": "Verified background checks", "included": true}',
    '{"feature": "Basic training support", "included": true}',
    '{"feature": "Email support", "included": true}'
  ]::jsonb[],
  15,
  1,
  false
),
(
  'Professional Plan',
  'Ideal for those seeking enhanced features and dedicated support.',
  15000,
  ARRAY[
    '{"feature": "Extended access to staff profiles", "included": true}',
    '{"feature": "Priority booking system", "included": true}',
    '{"feature": "24-hour replacement guarantee", "included": true}',
    '{"feature": "Comprehensive background checks", "included": true}',
    '{"feature": "Advanced training support", "included": true}',
    '{"feature": "Email & chat support", "included": true}',
    '{"feature": "Personalized onboarding", "included": true}',
    '{"feature": "Staff ratings & reviews access", "included": true}',
    '{"feature": "Monthly consultation sessions", "included": true}'
  ]::jsonb[],
  50,
  3,
  true
),
(
  'Enterprise Plan',
  'Complete solution with VIP access and premium support for businesses.',
  30000,
  ARRAY[
    '{"feature": "VIP access to top-rated staff", "included": true}',
    '{"feature": "Dedicated account manager", "included": true}',
    '{"feature": "Premium booking system", "included": true}',
    '{"feature": "Instant replacement guarantee", "included": true}',
    '{"feature": "Elite background verification", "included": true}',
    '{"feature": "Premium training packages", "included": true}',
    '{"feature": "24/7 priority support", "included": true}',
    '{"feature": "Executive onboarding", "included": true}',
    '{"feature": "Comprehensive staff insights", "included": true}',
    '{"feature": "Express 6-hour placement", "included": true}',
    '{"feature": "Exclusive webinars", "included": true}',
    '{"feature": "Multi-location support", "included": true}',
    '{"feature": "VIP perks & bonuses", "included": true}'
  ]::jsonb[],
  100,
  10,
  true
);