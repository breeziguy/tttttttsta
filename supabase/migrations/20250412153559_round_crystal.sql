/*
  # Fix Staff Hiring Status References

  1. Changes
    - Update foreign key to reference users_profile
    - Update existing records to use correct client IDs
    - Update RLS policies to use users_profile
    - Add performance indexes

  2. Security
    - Maintain RLS enabled
    - Update policies to use correct client relationship
*/

-- First, temporarily disable the foreign key constraint
ALTER TABLE staff_hiring_status
DROP CONSTRAINT IF EXISTS staff_hiring_status_client_id_fkey;

-- Update any existing records to use the correct client_id from users_profile
UPDATE staff_hiring_status shs
SET client_id = up.id
FROM client c
JOIN users_profile up ON c.contact_person_email = up.email
WHERE shs.client_id = c.id;

-- Now add the new foreign key constraint
ALTER TABLE staff_hiring_status
ADD CONSTRAINT staff_hiring_status_client_id_fkey
FOREIGN KEY (client_id) REFERENCES users_profile(id)
ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON staff_hiring_status;

-- Create new policy with updated reference
CREATE POLICY "Enable all access for authenticated users"
ON staff_hiring_status
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_hiring_status.client_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_hiring_status.client_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_client_id 
ON staff_hiring_status(client_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_staff_id 
ON staff_hiring_status(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_status 
ON staff_hiring_status(status);