/*
  # Add Free Plan and Update User Tiers

  1. Changes
    - Add 'basic' as default tier for free users
    - Insert free plan into subscription_plans
    - Update users without subscriptions to basic tier
    - Log changes in activity log

  2. Security
    - Maintain existing RLS policies
*/

-- Insert free plan if it doesn't exist
INSERT INTO subscription_plans (
  name,
  description,
  price,
  features,
  staff_access_percentage,
  max_staff_selections,
  allow_pdf_download,
  duration_days
)
SELECT
  'Basic Plan',
  'Start exploring our platform with basic features.',
  0,
  jsonb_build_array(
    'View limited staff profiles',
    'Basic search functionality',
    'Email support'
  ),
  0,
  0,
  false,
  30
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE price = 0
);

-- Update users without a subscription to basic tier
UPDATE users_profile
SET subscription_tier = 'basic'
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
  'Account set to Basic Plan',
  jsonb_build_object(
    'previous_tier', subscription_tier,
    'new_tier', 'basic'
  )
FROM users_profile
WHERE subscription_tier = 'basic';