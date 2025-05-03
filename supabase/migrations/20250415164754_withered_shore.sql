/*
  # Fix Staff Hiring Status Policies and Indexes

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Create new unified policy for authenticated users
    - Recreate indexes with proper naming
    - Add proper access controls

  2. Security
    - Maintain RLS enabled
    - Ensure proper client relationship checks
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON staff_hiring_status;
DROP POLICY IF EXISTS "Allow admins full access to staff_hiring_status" ON staff_hiring_status;
DROP POLICY IF EXISTS "Clients can manage their hiring records" ON staff_hiring_status;
DROP POLICY IF EXISTS "Enable authenticated user access" ON staff_hiring_status;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_staff_hiring_status_client_id;
DROP INDEX IF EXISTS idx_staff_hiring_status_staff_id;
DROP INDEX IF EXISTS idx_staff_hiring_status_status;
DROP INDEX IF EXISTS idx_shs_client_id;
DROP INDEX IF EXISTS idx_shs_staff_id;
DROP INDEX IF EXISTS idx_shs_status;

-- Create new unified policy
CREATE POLICY "Enable authenticated user access"
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

-- Create new indexes with shorter names
CREATE INDEX IF NOT EXISTS idx_shs_client_id 
  ON staff_hiring_status(client_id);

CREATE INDEX IF NOT EXISTS idx_shs_staff_id 
  ON staff_hiring_status(staff_id);

CREATE INDEX IF NOT EXISTS idx_shs_status 
  ON staff_hiring_status(status);