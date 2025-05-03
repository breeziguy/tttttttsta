/*
  # Fix Staff RLS Policies

  1. Changes
    - Update RLS policies for staff table
    - Add policies for admin access
    - Fix client access to staff data
    - Add proper indexes

  2. Security
    - Enable RLS
    - Add proper user validation
*/

-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete staff" ON staff;
DROP POLICY IF EXISTS "Admins can insert staff" ON staff;
DROP POLICY IF EXISTS "Admins can update staff" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Create new policies for staff table
CREATE POLICY "Admins can view all staff"
ON staff
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update staff"
ON staff
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can insert staff"
ON staff
FOR INSERT
TO authenticated
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can delete staff"
ON staff
FOR DELETE
TO authenticated
USING (is_admin_user());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_location ON staff(location);
CREATE INDEX IF NOT EXISTS idx_staff_level ON staff(level);
CREATE INDEX IF NOT EXISTS idx_staff_experience ON staff(experience);

-- Update staff_hiring_status policies
DROP POLICY IF EXISTS "Enable authenticated user access" ON staff_hiring_status;

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
  OR is_admin_user()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_hiring_status.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
);

-- Update staff_interviews policies
DROP POLICY IF EXISTS "Clients can view their interviews" ON staff_interviews;
DROP POLICY IF EXISTS "Clients can create interviews" ON staff_interviews;
DROP POLICY IF EXISTS "Clients can update their interviews" ON staff_interviews;

CREATE POLICY "Enable all access for authenticated users"
ON staff_interviews
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_interviews.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_interviews.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
);

-- Update staff_selections policies
DROP POLICY IF EXISTS "Allow clients to manage staff selections" ON staff_selections;

CREATE POLICY "Enable all access for authenticated users"
ON staff_selections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_selections.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_selections.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
);

-- Update staff_feedback policies
DROP POLICY IF EXISTS "Allow clients to view and create feedback" ON staff_feedback;
DROP POLICY IF EXISTS "Allow clients to create feedback" ON staff_feedback;

CREATE POLICY "Enable all access for authenticated users"
ON staff_feedback
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_feedback.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_feedback.client_id
    AND users_profile.user_id = auth.uid()
  )
  OR is_admin_user()
);