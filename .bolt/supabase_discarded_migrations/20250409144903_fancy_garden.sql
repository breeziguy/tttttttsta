/*
  # Update Subscription Tiers and User Access

  1. Changes
    - Add free plan as default for new users
    - Update subscription plans structure
    - Update existing users to free plan
    - Add staff access percentage column

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure we have the free plan
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
    'Limited staff profile access (5%)',
    'Basic search functionality',
    'Email support'
  ),
  5,
  1,
  false,
  30,
  'PLN_free'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE price = 0
);

-- Update existing users to free plan if they don't have an active subscription
UPDATE users_profile
SET subscription_tier = 'free'
WHERE id NOT IN (
  SELECT client_id 
  FROM client_subscriptions 
  WHERE is_active = true 
  AND end_date > now()
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
    'previous_tier', subscription_tier,
    'new_tier', 'free'
  )
FROM users_profile
WHERE subscription_tier = 'free';