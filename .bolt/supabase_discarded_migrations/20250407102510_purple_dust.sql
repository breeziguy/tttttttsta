/*
  # Update subscription plans table

  1. Changes
    - Remove tier references
    - Update features and descriptions
    - Set internal staff access percentages
    - Update plan names and pricing

  2. Security
    - Maintain existing RLS policies
*/

-- Update subscription plans table structure
ALTER TABLE subscription_plans 
DROP CONSTRAINT IF EXISTS subscription_plans_tier_check;

-- Update existing plans with new structure
UPDATE subscription_plans
SET 
  features = ARRAY[
    '{"feature": "Access to verified staff profiles", "included": true}',
    '{"feature": "Self-service booking system", "included": true}',
    '{"feature": "24-hour replacement guarantee", "included": true}',
    '{"feature": "Verified background checks", "included": true}',
    '{"feature": "Basic training support", "included": true}',
    '{"feature": "Email support", "included": true}'
  ]::jsonb[],
  staff_access_percentage = 15,
  max_staff_selections = 1,
  allow_pdf_download = false,
  name = 'Essential Plan',
  description = 'Perfect for individuals seeking reliable domestic staff with essential support.'
WHERE tier = 'basic';

UPDATE subscription_plans
SET 
  features = ARRAY[
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
  staff_access_percentage = 50,
  max_staff_selections = 3,
  allow_pdf_download = true,
  name = 'Professional Plan',
  description = 'Ideal for those seeking enhanced features and dedicated support.'
WHERE tier = 'standard';

UPDATE subscription_plans
SET 
  features = ARRAY[
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
  staff_access_percentage = 100,
  max_staff_selections = 10,
  allow_pdf_download = true,
  name = 'Enterprise Plan',
  description = 'Complete solution with VIP access and premium support for businesses.'
WHERE tier = 'premium';

-- Add new column for internal reference only
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS internal_tier text;