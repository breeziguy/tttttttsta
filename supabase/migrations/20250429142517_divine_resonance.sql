/*
  # Update User Profile Schema and Fields

  1. Changes
    - Add new address fields
    - Update children and pets fields
    - Remove old address fields
    - Add city field
*/

-- Add new columns
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS address_line1 text;

ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS address_line2 text;

ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS number_of_children integer DEFAULT 0;

-- Copy existing address data to address_line1, only if the address column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users_profile' AND column_name = 'address') THEN
        UPDATE users_profile
        SET address_line1 = address
        WHERE address IS NOT NULL;
    END IF;
END $$;

-- Drop old columns if they exist
ALTER TABLE users_profile
DROP COLUMN IF EXISTS address;

ALTER TABLE users_profile
DROP COLUMN IF EXISTS live_in_accommodation;

ALTER TABLE users_profile
DROP COLUMN IF EXISTS household_adults;

-- Add constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'number_of_children_check' AND conrelid = 'users_profile'::regclass) THEN
        ALTER TABLE users_profile ADD CONSTRAINT number_of_children_check CHECK (number_of_children >= 0);
    END IF;
END$$;

-- Update profile completion check function
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_profile_complete := CASE
    WHEN NEW.account_type = 'corporate' THEN
      NEW.full_name IS NOT NULL AND
      NEW.phone_number IS NOT NULL AND
      NEW.email IS NOT NULL AND
      NEW.address_line1 IS NOT NULL AND
      NEW.city IS NOT NULL AND
      NEW.location IS NOT NULL
    WHEN NEW.account_type = 'individual' THEN
      NEW.full_name IS NOT NULL AND
      NEW.phone_number IS NOT NULL AND
      NEW.email IS NOT NULL AND
      NEW.address_line1 IS NOT NULL AND
      NEW.city IS NOT NULL AND
      NEW.location IS NOT NULL
    ELSE false
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;