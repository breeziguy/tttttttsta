/*
  # Profile Information Updates

  1. New Types
    - Add enums for contact preferences and accommodation status
    - Add enums for industry types and job titles

  2. Changes
    - Add new columns to users_profile table for both individual and company profiles
    - Update profile completion check function
    - Add validation constraints

  3. Security
    - Maintain existing RLS policies
*/

-- Create new enum types
CREATE TYPE contact_preference AS ENUM ('Call', 'WhatsApp');
CREATE TYPE accommodation_status AS ENUM ('Available', 'Not Available');
CREATE TYPE industry_type AS ENUM (
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
);

-- Add new columns to users_profile
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS nin text,
ADD COLUMN IF NOT EXISTS household_adults integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_pets boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS live_in_accommodation accommodation_status,
ADD COLUMN IF NOT EXISTS working_hours text,
ADD COLUMN IF NOT EXISTS off_days text[],
ADD COLUMN IF NOT EXISTS preferred_contact contact_preference,
ADD COLUMN IF NOT EXISTS company_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS rc_number text,
ADD COLUMN IF NOT EXISTS industry industry_type,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS company_city_state text,
ADD COLUMN IF NOT EXISTS company_email text,
ADD COLUMN IF NOT EXISTS company_phone text,
ADD COLUMN IF NOT EXISTS representative_details jsonb DEFAULT '{}'::jsonb;

-- Add constraints
ALTER TABLE users_profile
ADD CONSTRAINT nin_format CHECK (nin ~ '^[0-9]{11}$' OR nin IS NULL),
ADD CONSTRAINT household_adults_check CHECK (household_adults >= 0),
ADD CONSTRAINT working_hours_format CHECK (working_hours ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' OR working_hours IS NULL),
ADD CONSTRAINT website_format CHECK (website ~ '^https?://.*' OR website IS NULL),
ADD CONSTRAINT company_email_format CHECK (company_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR company_email IS NULL),
ADD CONSTRAINT company_phone_format CHECK (company_phone ~ '^[0-9+\-\s]*$' OR company_phone IS NULL);

-- Update profile completion check function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  -- Check if all required fields are filled based on account type
  NEW.is_profile_complete := CASE
    WHEN NEW.account_type = 'individual' THEN
      NEW.full_name IS NOT NULL AND
      NEW.phone_number IS NOT NULL AND
      NEW.email IS NOT NULL AND
      NEW.address IS NOT NULL AND
      NEW.location IS NOT NULL AND
      NEW.working_hours IS NOT NULL AND
      NEW.household_adults IS NOT NULL AND
      NEW.has_children IS NOT NULL AND
      NEW.has_pets IS NOT NULL AND
      NEW.live_in_accommodation IS NOT NULL AND
      NEW.preferred_contact IS NOT NULL
    WHEN NEW.account_type = 'corporate' THEN
      NEW.company_name IS NOT NULL AND
      NEW.rc_number IS NOT NULL AND
      NEW.industry IS NOT NULL AND
      NEW.company_address IS NOT NULL AND
      NEW.company_city_state IS NOT NULL AND
      NEW.company_email IS NOT NULL AND
      NEW.company_phone IS NOT NULL AND
      NEW.representative_details IS NOT NULL AND
      NEW.representative_details != '{}'::jsonb
    ELSE false
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_account_type ON users_profile(account_type);
CREATE INDEX IF NOT EXISTS idx_users_profile_industry ON users_profile(industry);
CREATE INDEX IF NOT EXISTS idx_users_profile_completion ON users_profile(is_profile_complete);