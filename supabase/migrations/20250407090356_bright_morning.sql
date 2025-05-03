/*
  # Fix Staff Interviews RLS Policies

  1. Changes
    - Update RLS policies for staff_interviews table
    - Fix client relationship check in policies
    - Ensure proper access control for interview scheduling

  2. Security
    - Modify policies to use proper client relationship check
    - Ensure authenticated users can only access their own data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their interviews" ON staff_interviews;
DROP POLICY IF EXISTS "Clients can create interviews" ON staff_interviews;
DROP POLICY IF EXISTS "Clients can update their interviews" ON staff_interviews;

-- Create new policies with correct client relationship check
CREATE POLICY "Clients can view their interviews"
  ON staff_interviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.user_id = auth.uid()
      AND users_profile.id = staff_interviews.client_id
    )
  );

CREATE POLICY "Clients can create interviews"
  ON staff_interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.user_id = auth.uid()
      AND users_profile.id = staff_interviews.client_id
    )
  );

CREATE POLICY "Clients can update their interviews"
  ON staff_interviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.user_id = auth.uid()
      AND users_profile.id = staff_interviews.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.user_id = auth.uid()
      AND users_profile.id = staff_interviews.client_id
    )
  );