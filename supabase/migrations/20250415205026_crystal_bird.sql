/*
  # Update Admin Users RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Add new policies for admin access
    - Enable RLS on admin_users table
    - Add performance indexes

  2. Security
    - Only allow access to users in admin_users table
    - Maintain strict access control
*/

-- Enable RLS if not already enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON admin_users;

-- Create new policy for admin access
CREATE POLICY "Enable all access for authenticated users"
ON admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Updated RLS policies for admin_users table';
  RAISE NOTICE 'Added policy to restrict access to admin users only';
END $$;