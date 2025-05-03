/*
  # Fix Profile Information Updates

  1. Changes
    - Update profile information fields
    - Add new constraints and validations
    - Fix foreign key references
*/

-- Update profile information fields
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS contact_preference TEXT,
ADD COLUMN IF NOT EXISTS accommodation_status TEXT,
ADD COLUMN IF NOT EXISTS industry_type TEXT;

-- Add constraints
ALTER TABLE users_profile
ADD CONSTRAINT contact_preference_check 
  CHECK (contact_preference IN ('Call', 'WhatsApp')),
ADD CONSTRAINT accommodation_status_check 
  CHECK (accommodation_status IN ('Available', 'Not Available')),
ADD CONSTRAINT industry_type_check 
  CHECK (industry_type IN (
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
  ));

-- Update foreign key references
DO $$ 
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_profile_user_id_fkey'
  ) THEN
    ALTER TABLE users_profile 
    DROP CONSTRAINT users_profile_user_id_fkey;
  END IF;

  -- Add new foreign key with cascade delete
  ALTER TABLE users_profile
  ADD CONSTRAINT users_profile_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
END $$;

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = 'set_updated_at'
  ) THEN
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;