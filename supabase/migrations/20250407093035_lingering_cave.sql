/*
  # Update RLS policies for staff hiring status

  1. Changes
    - Enable RLS on staff_hiring_status table
    - Add policies for clients to manage their hiring records
    - Allow authenticated users to insert and update their own records
*/

-- Enable RLS
ALTER TABLE staff_hiring_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access" ON staff_hiring_status;
DROP POLICY IF EXISTS "Clients can update hiring status" ON staff_hiring_status;
DROP POLICY IF EXISTS "Clients can view their hiring status" ON staff_hiring_status;

-- Create new policies
CREATE POLICY "Clients can manage their hiring records"
ON staff_hiring_status
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.user_id = auth.uid()
    AND users_profile.id = staff_hiring_status.client_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.user_id = auth.uid()
    AND users_profile.id = staff_hiring_status.client_id
  )
);