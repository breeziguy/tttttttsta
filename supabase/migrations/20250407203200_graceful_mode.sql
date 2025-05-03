/*
  # Check Subscription Plans Schema

  1. Purpose
    - Query existing subscription plans table structure
    - View current data in the table
    - Ensure we don't duplicate or override existing data

  Note: This is a read-only migration to inspect the current schema
*/

-- Check table structure
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- Check existing data
SELECT * FROM subscription_plans;