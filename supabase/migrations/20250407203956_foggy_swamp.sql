/*
  # Update Subscription Plans Schema and Data

  1. Changes
    - Add staff_access_percentage column
    - Update subscription plans with new features and pricing
    - Update descriptions and names
    - Include duration_days field in all operations
*/

-- Add staff_access_percentage column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'staff_access_percentage'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD COLUMN staff_access_percentage integer NOT NULL DEFAULT 100;
  END IF;
END $$;

-- Update subscription plans with new structure
UPDATE subscription_plans
SET 
  name = 'Essential Plan',
  description = 'Perfect for individuals seeking reliable domestic staff with essential support.',
  price = 12000,
  duration_days = 30,
  features = '[
    {"feature": "Access to verified staff profiles", "included": true},
    {"feature": "Self-service booking system", "included": true},
    {"feature": "24-hour replacement guarantee", "included": true},
    {"feature": "Verified background checks", "included": true},
    {"feature": "Basic training support", "included": true},
    {"feature": "Email support", "included": true}
  ]'::jsonb,
  staff_access_percentage = 15,
  max_staff_selections = 1,
  allow_pdf_download = false
WHERE name = 'Basic Plan'
OR name ILIKE '%basic%'
OR price = (SELECT MIN(price) FROM subscription_plans);

UPDATE subscription_plans
SET 
  name = 'Professional Plan',
  description = 'Ideal for those seeking enhanced features and dedicated support.',
  price = 15000,
  duration_days = 30,
  features = '[
    {"feature": "Extended access to staff profiles", "included": true},
    {"feature": "Priority booking system", "included": true},
    {"feature": "24-hour replacement guarantee", "included": true},
    {"feature": "Comprehensive background checks", "included": true},
    {"feature": "Advanced training support", "included": true},
    {"feature": "Email & chat support", "included": true},
    {"feature": "Personalized onboarding", "included": true},
    {"feature": "Staff ratings & reviews access", "included": true},
    {"feature": "Monthly consultation sessions", "included": true}
  ]'::jsonb,
  staff_access_percentage = 50,
  max_staff_selections = 3,
  allow_pdf_download = true
WHERE name = 'Standard Plan'
OR name ILIKE '%standard%'
OR price = (
  SELECT price 
  FROM subscription_plans 
  WHERE price > (SELECT MIN(price) FROM subscription_plans) 
  ORDER BY price ASC 
  LIMIT 1
);

UPDATE subscription_plans
SET 
  name = 'Enterprise Plan',
  description = 'Complete solution with VIP access and premium support for businesses.',
  price = 30000,
  duration_days = 30,
  features = '[
    {"feature": "VIP access to top-rated staff", "included": true},
    {"feature": "Dedicated account manager", "included": true},
    {"feature": "Premium booking system", "included": true},
    {"feature": "Instant replacement guarantee", "included": true},
    {"feature": "Elite background verification", "included": true},
    {"feature": "Premium training packages", "included": true},
    {"feature": "24/7 priority support", "included": true},
    {"feature": "Executive onboarding", "included": true},
    {"feature": "Comprehensive staff insights", "included": true},
    {"feature": "Express 6-hour placement", "included": true},
    {"feature": "Exclusive webinars", "included": true},
    {"feature": "Multi-location support", "included": true},
    {"feature": "VIP perks & bonuses", "included": true}
  ]'::jsonb,
  staff_access_percentage = 100,
  max_staff_selections = 10,
  allow_pdf_download = true
WHERE name = 'Premium Plan'
OR name ILIKE '%premium%'
OR name ILIKE '%enterprise%'
OR price = (SELECT MAX(price) FROM subscription_plans);

-- Insert any missing plans
INSERT INTO subscription_plans (
  name,
  description,
  price,
  duration_days,
  features,
  staff_access_percentage,
  max_staff_selections,
  allow_pdf_download
)
SELECT * FROM (
  VALUES 
    (
      'Essential Plan',
      'Perfect for individuals seeking reliable domestic staff with essential support.',
      12000,
      30,
      '[
        {"feature": "Access to verified staff profiles", "included": true},
        {"feature": "Self-service booking system", "included": true},
        {"feature": "24-hour replacement guarantee", "included": true},
        {"feature": "Verified background checks", "included": true},
        {"feature": "Basic training support", "included": true},
        {"feature": "Email support", "included": true}
      ]'::jsonb,
      15,
      1,
      false
    ),
    (
      'Professional Plan',
      'Ideal for those seeking enhanced features and dedicated support.',
      15000,
      30,
      '[
        {"feature": "Extended access to staff profiles", "included": true},
        {"feature": "Priority booking system", "included": true},
        {"feature": "24-hour replacement guarantee", "included": true},
        {"feature": "Comprehensive background checks", "included": true},
        {"feature": "Advanced training support", "included": true},
        {"feature": "Email & chat support", "included": true},
        {"feature": "Personalized onboarding", "included": true},
        {"feature": "Staff ratings & reviews access", "included": true},
        {"feature": "Monthly consultation sessions", "included": true}
      ]'::jsonb,
      50,
      3,
      true
    ),
    (
      'Enterprise Plan',
      'Complete solution with VIP access and premium support for businesses.',
      30000,
      30,
      '[
        {"feature": "VIP access to top-rated staff", "included": true},
        {"feature": "Dedicated account manager", "included": true},
        {"feature": "Premium booking system", "included": true},
        {"feature": "Instant replacement guarantee", "included": true},
        {"feature": "Elite background verification", "included": true},
        {"feature": "Premium training packages", "included": true},
        {"feature": "24/7 priority support", "included": true},
        {"feature": "Executive onboarding", "included": true},
        {"feature": "Comprehensive staff insights", "included": true},
        {"feature": "Express 6-hour placement", "included": true},
        {"feature": "Exclusive webinars", "included": true},
        {"feature": "Multi-location support", "included": true},
        {"feature": "VIP perks & bonuses", "included": true}
      ]'::jsonb,
      100,
      10,
      true
    )
) AS new_plans (
  name,
  description,
  price,
  duration_days,
  features,
  staff_access_percentage,
  max_staff_selections,
  allow_pdf_download
)
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE subscription_plans.name = new_plans.name
);