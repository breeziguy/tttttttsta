/*
  # Fix Vettings RLS Policies

  1. Changes
    - Update RLS policies to correctly check user profile ID
    - Fix policy checks for submitted_by column
    - Maintain admin access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON vettings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vettings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON vettings;

-- Create new policies that check against users_profile
CREATE POLICY "Enable read access for authenticated users"
ON vettings
FOR SELECT
TO authenticated
USING (
  submitted_by IN (
    SELECT id FROM users_profile WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON vettings
FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by IN (
    SELECT id FROM users_profile WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users"
ON vettings
FOR UPDATE
TO authenticated
USING (
  submitted_by IN (
    SELECT id FROM users_profile WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
)
WITH CHECK (
  submitted_by IN (
    SELECT id FROM users_profile WHERE user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);