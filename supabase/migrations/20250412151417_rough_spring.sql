/*
  # Fix Staff Hiring Status RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Add new policies for staff hiring status
    - Allow authenticated users to manage their own hiring records
    - Ensure proper client_id validation

  2. Security
    - Maintain RLS enabled
    - Add proper checks for client_id
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Allow admins full access to staff_hiring_status" ON staff_hiring_status;
DROP POLICY IF EXISTS "Clients can manage their hiring records" ON staff_hiring_status;

-- Create new policies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_client_id 
ON staff_hiring_status(client_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_staff_id 
ON staff_hiring_status(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_hiring_status_status 
ON staff_hiring_status(status);