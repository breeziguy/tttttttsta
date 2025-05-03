/*
  # Add Profile Fields Migration

  1. New Fields
    - `staff_requirements` (jsonb): Stores staff preferences and requirements for individual accounts
    - `whatsapp_number` (text): Optional WhatsApp contact number
    - `location` (text): City/State information for placement relevance
    - `referral_code` (text): Optional referral tracking code

  2. Changes
    - Add new columns to users_profile table
    - Add validation check for whatsapp_number format
    - Add validation check for location length

  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns to users_profile table
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS staff_requirements jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS referral_code text;

-- Add validation checks
ALTER TABLE users_profile
ADD CONSTRAINT whatsapp_format CHECK (whatsapp_number ~ '^[0-9+\-\s]*$'),
ADD CONSTRAINT location_length CHECK (char_length(location) >= 2);

-- Update profile completion check function
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
    CASE
      WHEN NEW.account_type = 'corporate' THEN
        NEW.company_name IS NOT NULL AND
        NEW.business_address IS NOT NULL AND
        NEW.industry IS NOT NULL
      ELSE
        NEW.staff_requirements IS NOT NULL AND
        NEW.staff_requirements != '{}'::jsonb
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;