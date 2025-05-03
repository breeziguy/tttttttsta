/*
  # Add Paystack Plan Codes to Subscription Plans

  1. Changes
    - Add plan_code column to subscription_plans table
    - Update existing plans with Paystack plan codes
    - Handle duplicate records
    - Clean up data before adding constraints

  2. Security
    - Maintain existing RLS policies
*/

-- First clean up any duplicate plans
WITH ranked_plans AS (
  SELECT 
    id,
    name,
    price,
    ROW_NUMBER() OVER (
      PARTITION BY 
        CASE 
          WHEN name = 'Basic Plan' OR name ILIKE '%basic%' OR price = 12000 THEN 'basic'
          WHEN name = 'Standard Plan' OR name ILIKE '%standard%' OR price = 15000 THEN 'standard'
          WHEN name = 'Premium Plan' OR name ILIKE '%premium%' OR price = 30000 THEN 'premium'
        END
      ORDER BY created_at DESC
    ) as rn
  FROM subscription_plans
)
DELETE FROM subscription_plans
WHERE id IN (
  SELECT id 
  FROM ranked_plans 
  WHERE rn > 1
);

-- Remove any existing plan_code column and constraint
DO $$ 
BEGIN
  -- Drop the constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscription_plans_plan_code_key'
  ) THEN
    ALTER TABLE subscription_plans DROP CONSTRAINT subscription_plans_plan_code_key;
  END IF;

  -- Drop the column if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'plan_code'
  ) THEN
    ALTER TABLE subscription_plans DROP COLUMN plan_code;
  END IF;
END $$;

-- Add plan_code column
ALTER TABLE subscription_plans
ADD COLUMN plan_code text;

-- Update each plan individually to ensure no conflicts
WITH basic_plan AS (
  SELECT id 
  FROM subscription_plans 
  WHERE (name = 'Basic Plan' OR name ILIKE '%basic%' OR price = 12000)
  AND plan_code IS NULL
  ORDER BY created_at DESC
  FETCH FIRST 1 ROW ONLY
)
UPDATE subscription_plans
SET plan_code = 'PLN_vzyi77m91w4m13y'
WHERE id IN (SELECT id FROM basic_plan);

WITH standard_plan AS (
  SELECT id 
  FROM subscription_plans 
  WHERE (name = 'Standard Plan' OR name ILIKE '%standard%' OR price = 15000)
  AND plan_code IS NULL
  ORDER BY created_at DESC
  FETCH FIRST 1 ROW ONLY
)
UPDATE subscription_plans
SET plan_code = 'PLN_582angv020qev89'
WHERE id IN (SELECT id FROM standard_plan);

WITH premium_plan AS (
  SELECT id 
  FROM subscription_plans 
  WHERE (name = 'Premium Plan' OR name ILIKE '%premium%' OR price = 30000)
  AND plan_code IS NULL
  ORDER BY created_at DESC
  FETCH FIRST 1 ROW ONLY
)
UPDATE subscription_plans
SET plan_code = 'PLN_pwbeyh6m3lrpn3n'
WHERE id IN (SELECT id FROM premium_plan);

-- Verify no duplicates exist before adding constraint
DO $$
DECLARE
  duplicate_count integer;
BEGIN
  SELECT COUNT(*) - COUNT(DISTINCT plan_code)
  INTO duplicate_count
  FROM subscription_plans
  WHERE plan_code IS NOT NULL;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Duplicate plan codes found. Cannot add unique constraint.';
  END IF;
END $$;

-- Now add the unique constraint
ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_plan_code_key UNIQUE (plan_code);

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Added Paystack plan codes to subscription plans';
  RAISE NOTICE 'Basic Plan: PLN_vzyi77m91w4m13y';
  RAISE NOTICE 'Standard Plan: PLN_582angv020qev89';
  RAISE NOTICE 'Premium Plan: PLN_pwbeyh6m3lrpn3n';
END $$;