/*
  # Update Staff Roles/Types

  1. Changes
    - Remove "Elderly Care" and "Office Assistant" from staff_type enum
    - Add "Chef", "Cleaner", and "Ironing Man" to staff_type enum
*/

-- Create a new enum type with the updated values
CREATE TYPE staff_type_new AS ENUM (
  'Nanny',
  'Housekeeper',
  'Cook',
  'Driver',
  'Security',
  'Chef',
  'Cleaner',
  'Ironing Man'
);

-- Update existing data to map removed values to new ones
UPDATE staff
SET role = 
  CASE 
    WHEN role = 'Elderly Care' THEN 'Cleaner'
    WHEN role = 'Office Assistant' THEN 'Cleaner'
    ELSE role
  END;

-- Drop the old type and rename the new one
ALTER TYPE staff_type RENAME TO staff_type_old;
ALTER TYPE staff_type_new RENAME TO staff_type; 