/*
  # Update Subscription Plans and Tiers

  1. Changes
    - Temporarily alter subscription_tier column to text
    - Drop and recreate subscription_tier enum with new values
    - Convert column back to enum type
    - Update subscription plans with proper pricing and features
    - Set all users to basic tier initially

  2. Security
    - Maintain existing RLS policies
*/

-- First convert subscription_tier to text to allow modification
ALTER TABLE users_profile 
ALTER COLUMN subscription_tier TYPE text;

-- Drop and recreate the enum type
DROP TYPE IF EXISTS subscription_tier CASCADE;
CREATE TYPE subscription_tier AS ENUM ('basic', 'standard', 'premium');

-- Convert column back to enum and set default value
ALTER TABLE users_profile 
ALTER COLUMN subscription_tier TYPE subscription_tier 
USING (
  CASE 
    WHEN subscription_tier IS NULL THEN 'basic'::subscription_tier
    ELSE subscription_tier::subscription_tier
  END
);

ALTER TABLE users_profile
ALTER COLUMN subscription_tier SET DEFAULT 'basic'::subscription_tier;

-- Clean up any existing plans
DELETE FROM subscription_plans;

-- Insert the subscription plans
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
  30,
  1,
  false,
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
  70,
  3,
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

-- Update all users to basic tier
UPDATE users_profile
SET subscription_tier = 'basic'
WHERE subscription_tier IS NULL;

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
  'Account set to Basic Plan',
  jsonb_build_object(
    'previous_tier', 'none',
    'new_tier', 'basic'
  )
FROM users_profile
WHERE subscription_tier = 'basic';