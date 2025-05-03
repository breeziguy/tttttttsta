/*
  # Fix subscription plans migration

  1. Changes
    - Add check for existing trigger before creation
    - Update subscription plans table structure
    - Insert initial subscription plans
*/

-- Create subscription plans table if it doesn't exist
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

-- Enable RLS if not already enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' 
    AND policyname = 'Allow public read access to subscription plans'
  ) THEN
    CREATE POLICY "Allow public read access to subscription plans"
      ON subscription_plans
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' 
    AND policyname = 'Allow admin write access to subscription plans'
  ) THEN
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
  END IF;
END $$;

-- Create trigger for updating updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_timestamp_subscription_plans'
  ) THEN
    CREATE TRIGGER set_timestamp_subscription_plans
      BEFORE UPDATE ON subscription_plans
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Delete existing plans to avoid duplicates
DELETE FROM subscription_plans;

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