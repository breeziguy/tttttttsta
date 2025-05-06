/*
  # Update Staff Accommodation Status 

  1. Changes
    - Convert staff.accommodation_status from free text to an ENUM type
    - Use "Required" and "Non Required" as the allowed values
*/

-- First, create the enum type for accommodation status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accommodation_status') THEN
    CREATE TYPE accommodation_status AS ENUM ('Required', 'Non Required');
  END IF;
END $$;

-- Convert existing data to match the new values
-- Map all existing text values to either "Required" or "Non Required"
UPDATE staff
SET accommodation_status = 
  CASE 
    -- Consider all existing values as indicating some form of accommodation needs
    WHEN accommodation_status IS NOT NULL AND accommodation_status != '' THEN 'Required'
    ELSE 'Non Required'
  END::text;

-- Alter the staff table to use the enum type
ALTER TABLE staff 
  ALTER COLUMN accommodation_status TYPE accommodation_status USING accommodation_status::accommodation_status; 