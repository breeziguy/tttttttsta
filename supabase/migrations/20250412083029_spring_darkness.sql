/*
  # Combined Database Changes

  1. Profile Updates
    - Add new columns for contact preferences and status
    - Update constraints and foreign keys
    - Fix subscription tiers and plans

  2. Security
    - Update RLS policies
    - Add necessary indexes
    - Maintain existing policies
*/

-- First ensure we have the necessary types
DO $$ 
BEGIN
  -- Create contact_preference type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_preference') THEN
    CREATE TYPE contact_preference AS ENUM ('Call', 'WhatsApp');
  END IF;

  -- Create accommodation_status type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accommodation_status') THEN
    CREATE TYPE accommodation_status AS ENUM ('Available', 'Not Available');
  END IF;

  -- Create industry_type type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'industry_type') THEN
    CREATE TYPE industry_type AS ENUM (
      'Technology',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Retail',
      'Financial Services',
      'Real Estate',
      'Construction',
      'Hospitality',
      'Other'
    );
  END IF;
END $$;

-- Update users_profile table
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS contact_preference contact_preference,
ADD COLUMN IF NOT EXISTS accommodation_status accommodation_status,
ADD COLUMN IF NOT EXISTS industry_type industry_type;

-- Create vettings table if it doesn't exist
CREATE TABLE IF NOT EXISTS vettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    experience INTEGER,
    skills TEXT[],
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on vettings
ALTER TABLE vettings ENABLE ROW LEVEL SECURITY;

-- Create policies for vettings
CREATE POLICY "Enable read access for all users"
ON vettings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON vettings
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

CREATE POLICY "Enable update for authenticated users"
ON vettings
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vettings_staff_id ON vettings(staff_id);
CREATE INDEX IF NOT EXISTS idx_vettings_name ON vettings(name);
CREATE INDEX IF NOT EXISTS idx_vettings_email ON vettings(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_user_id ON users_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_account_type ON users_profile(account_type);

-- Update subscription tiers
DO $$
BEGIN
  -- First convert subscription_tier to text
  ALTER TABLE users_profile 
  ALTER COLUMN subscription_tier TYPE text;

  -- Drop and recreate the enum type
  DROP TYPE IF EXISTS subscription_tier CASCADE;
  CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'standard', 'premium');

  -- Convert column back to enum
  ALTER TABLE users_profile 
  ALTER COLUMN subscription_tier TYPE subscription_tier 
  USING (
    CASE 
      WHEN subscription_tier IS NULL OR subscription_tier = 'basic' THEN 'free'::subscription_tier
      ELSE subscription_tier::subscription_tier
    END
  );

  -- Set default value
  ALTER TABLE users_profile
  ALTER COLUMN subscription_tier SET DEFAULT 'free'::subscription_tier;
END $$;

-- Update subscription plans
DELETE FROM subscription_plans;

INSERT INTO subscription_plans (
  name,
  description,
  price,
  features,
  staff_access_percentage,
  max_staff_selections,
  allow_pdf_download,
  duration_days,
  plan_code
) VALUES 
(
  'Free Plan',
  'Start exploring our platform with basic features.',
  0,
  jsonb_build_array(
    'Limited staff profile access',
    'Basic search functionality',
    'Email support'
  ),
  100,
  10,
  true,
  30,
  'PLN_free'
),
(
  'Basic Plan',
  'Perfect for individuals seeking reliable domestic staff with essential support.',
  12000,
  jsonb_build_array(
    'Access to verified staff profiles',
    'Self-service booking system',
    '24-hour replacement guarantee',
    'Verified background checks',
    'Basic training support',
    'Email support'
  ),
  100,
  10,
  true,
  30,
  'PLN_vzyi77m91w4m13y'
),
(
  'Standard Plan',
  'Ideal for those seeking enhanced features and dedicated support.',
  15000,
  jsonb_build_array(
    'Extended access to staff profiles',
    'Priority booking system',
    '24-hour replacement guarantee',
    'Comprehensive background checks',
    'Advanced training support',
    'Email & chat support',
    'Personalized onboarding',
    'Staff ratings & reviews access',
    'Monthly consultation sessions'
  ),
  100,
  10,
  true,
  30,
  'PLN_582angv020qev89'
),
(
  'Premium Plan',
  'Complete solution with VIP access and premium support for businesses.',
  30000,
  jsonb_build_array(
    'VIP access to all staff profiles',
    'Dedicated account manager',
    'Premium booking system',
    'Instant replacement guarantee',
    'Elite background verification',
    'Premium training packages',
    '24/7 priority support',
    'Executive onboarding',
    'Comprehensive staff insights',
    'Express 6-hour placement',
    'Exclusive webinars',
    'Multi-location support',
    'VIP perks & bonuses'
  ),
  100,
  10,
  true,
  30,
  'PLN_pwbeyh6m3lrpn3n'
);

-- Log the changes
INSERT INTO activity_log (
  user_id,
  activity_type,
  description,
  metadata
)
SELECT 
  id,
  'subscription_update',
  'Account set to Free Plan',
  jsonb_build_object(
    'previous_tier', 'basic',
    'new_tier', 'free'
  )
FROM users_profile
WHERE subscription_tier = 'free';