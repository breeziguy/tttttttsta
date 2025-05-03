/*
  # Complete Profile Schema Update

  1. New Types
    - staff_duration_type: Employment duration options
    - gender_preference: Staff gender preferences
    - staff_type: Types of staff positions
    - staff_requirement: Composite type for staff requirements
    - company_detail: Composite type for company information

  2. Profile Enhancements
    - Add new columns for profile completion
    - Add validation constraints
    - Update completion check function

  3. Security
    - Ensure RLS is enabled
    - Add missing policies if not exist
*/

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE staff_duration_type AS ENUM ('Full-time', 'Part-time', 'Live-in', 'Temporary');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_preference AS ENUM ('Male', 'Female', 'No Preference');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE staff_type AS ENUM (
    'Nanny',
    'Housekeeper',
    'Cook',
    'Driver',
    'Security',
    'Elderly Care',
    'Office Assistant'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to users_profile if they don't exist
DO $$ BEGIN
  ALTER TABLE users_profile
    ADD COLUMN IF NOT EXISTS whatsapp_number text,
    ADD COLUMN IF NOT EXISTS location text,
    ADD COLUMN IF NOT EXISTS referral_code text,
    ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS completion_step integer DEFAULT 1,
    ADD COLUMN IF NOT EXISTS staff_requirements jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS company_details jsonb DEFAULT '{}'::jsonb;
END $$;

-- Add constraints if they don't exist
DO $$ BEGIN
  ALTER TABLE users_profile
    ADD CONSTRAINT whatsapp_format CHECK (whatsapp_number ~ '^[0-9+\-\s]*$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users_profile
    ADD CONSTRAINT location_length CHECK (char_length(location) >= 2);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users_profile
    ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create composite types if they don't exist
DO $$ BEGIN
  CREATE TYPE staff_requirement AS (
    staff_types staff_type[],
    duration_type staff_duration_type,
    preferred_gender gender_preference,
    preferred_age_range int4range,
    service_address text,
    start_date date,
    budget_range numrange
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE company_detail AS (
    registration_number text,
    industry text,
    company_size text,
    staff_count integer,
    locations text[],
    contract_types text[]
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update or create profile completion check function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  -- Check if all required fields are filled
  NEW.is_profile_complete := (
    NEW.full_name IS NOT NULL AND
    NEW.full_name != '' AND
    NEW.phone_number IS NOT NULL AND
    NEW.address IS NOT NULL AND
    NEW.location IS NOT NULL AND
    NEW.terms_accepted = true AND
    CASE
      WHEN NEW.account_type = 'corporate' THEN
        NEW.company_details IS NOT NULL AND
        NEW.company_details != '{}'::jsonb
      ELSE
        NEW.staff_requirements IS NOT NULL AND
        NEW.staff_requirements != '{}'::jsonb
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON users_profile;
CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion();

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;

-- Create new policies
CREATE POLICY "Users can view own profile"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_completion ON users_profile (is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_users_profile_account_type ON users_profile (account_type);
CREATE INDEX IF NOT EXISTS idx_users_profile_location ON users_profile (location);