/*
  # Update staff hiring status RLS policies

  1. Changes
    - Add RLS policy to allow clients to insert hiring records
    - Policy checks that the client_id matches the user's profile ID
    - Maintains existing policies for other operations

  2. Security
    - Only allows clients to create records for their own profile
    - Validates client ID through users_profile table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can manage their hiring records" ON staff_hiring_status;

-- Create new policies with correct permissions
CREATE POLICY "Clients can manage their hiring records"
ON staff_hiring_status
FOR ALL
TO authenticated
USING (
  client_id IN (
    SELECT id 
    FROM users_profile 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT id 
    FROM users_profile 
    WHERE user_id = auth.uid()
  )
);