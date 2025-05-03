/*
  # Update Subscription Plans and User Tiers

  1. Changes
    - Update all users to basic tier temporarily
    - Clean up existing plans
    - Insert new subscription plans with proper pricing and features
    - Log changes in activity log

  2. Security
    - Maintain existing RLS policies
*/

-- First update all users to basic tier to avoid conflicts
UPDATE users_profile
SET subscription_tier = 'basic'
WHERE subscription_tier IS NULL;

-- Clean up any existing plans
DELETE FROM subscription_plans;

-- Insert the paid plans
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
    'previous_tier', subscription_tier,
    'new_tier', 'basic'
  )
FROM users_profile
WHERE subscription_tier = 'basic';