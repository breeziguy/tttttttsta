/*
  # Update User Profile Schema and Fields

  1. Changes
    - Add new address fields
    - Update children and pets fields
    - Remove live-in accommodation
    - Add city field
*/

-- First, add new columns
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS number_of_children integer DEFAULT 0;

-- Copy existing address data to address_line1
UPDATE users_profile
SET address_line1 = address
WHERE address IS NOT NULL;

-- Drop old columns
ALTER TABLE users_profile
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS live_in_accommodation,
DROP COLUMN IF EXISTS household_adults;

-- Add constraints
ALTER TABLE users_profile
ADD CONSTRAINT number_of_children_check CHECK (number_of_children >= 0);

-- Update profile completion check function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS trigger AS $$
BEGIN
  NEW.is_profile_complete := CASE
    WHEN NEW.account_type = 'individual' THEN
      NEW.full_name IS NOT NULL AND
      NEW.phone_number IS NOT NULL AND
      NEW.email IS NOT NULL AND
      NEW.address_line1 IS NOT NULL AND
      NEW.city IS NOT NULL AND
      NEW.location IS NOT NULL
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