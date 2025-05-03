/*
  # Fix Subscription Plans and User Tiers

  1. Changes
    - Ensure free plan exists
    - Update subscription tiers
    - Fix user subscription tier for specific email
*/

-- First ensure we have a free plan
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
)
SELECT
  'Free Plan',
  'Start exploring our platform with basic features.',
  0,
  jsonb_build_array(
    'Limited staff profile access',
    'Basic search functionality',
    'Email support'
  ),
  5, -- Only 5% access to staff profiles
  1,  -- Can only select one staff at a time
  false,
  30,
  'PLN_free'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE price = 0
);

-- Update specific user's subscription to free plan
UPDATE users_profile 
SET subscription_tier = 'basic'
WHERE email = 'lemonnadeltd@gmail.com';

-- Log the change
INSERT INTO activity_log (
  user_id,
  activity_type,
  description,
  metadata
)
SELECT 
  id,
  'subscription_update',
  'Subscription updated to Free Plan',
  jsonb_build_object(
    'previous_tier', subscription_tier,
    'new_tier', 'basic'
  )
FROM users_profile
WHERE email = 'lemonnadeltd@gmail.com';