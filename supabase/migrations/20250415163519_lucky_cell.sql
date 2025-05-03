/*
  # Fix Staff Hiring Status RLS Policies

  1. Changes
    - Drop and recreate RLS policies
    - Update indexes for performance
    - Ensure proper client_id validation

  2. Security
    - Maintain RLS enabled
    - Add proper checks for client_id
*/

-- Drop the existing policy first
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON staff_hiring_status;

-- Wait a moment to ensure policy is dropped
SELECT pg_sleep(0.1);

-- Create new policy
CREATE POLICY "Enable all access for authenticated users"
ON staff_hiring_status
FOR ALL
TO authenticated
USING (
  -- Check if the user is associated with the client_id
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_hiring_status.client_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Ensure the client_id matches the user's profile
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_hiring_status.client_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_staff_hiring_status_client_id;
DROP INDEX IF EXISTS idx_staff_hiring_status_staff_id;
DROP INDEX IF EXISTS idx_staff_hiring_status_status;

-- Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_client_id 
ON staff_hiring_status(client_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_staff_id 
ON staff_hiring_status(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_status 
ON staff_hiring_status(status);