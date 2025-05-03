/*
  # Update staff hiring status RLS policies

  1. Changes
    - Drop existing RLS policies on staff_hiring_status table
    - Add new policies to allow:
      - Clients to insert records for their own staff
      - Clients to update their own records
      - Clients and admins to view their own records
  
  2. Security
    - Enable RLS on staff_hiring_status table
    - Add policies for authenticated users
    - Restrict access based on client_id matching
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can manage their hiring records" ON staff_hiring_status;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users" 
ON staff_hiring_status
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insert if the client_id matches a client record associated with the user
  EXISTS (
    SELECT 1 FROM client 
    WHERE id = staff_hiring_status.client_id 
    AND contact_person_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Enable update for authenticated users" 
ON staff_hiring_status
FOR UPDATE
TO authenticated
USING (
  -- Allow update if the client_id matches a client record associated with the user
  EXISTS (
    SELECT 1 FROM client 
    WHERE id = staff_hiring_status.client_id 
    AND contact_person_email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  -- Allow update if the client_id matches a client record associated with the user
  EXISTS (
    SELECT 1 FROM client 
    WHERE id = staff_hiring_status.client_id 
    AND contact_person_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Enable select for authenticated users" 
ON staff_hiring_status
FOR SELECT
TO authenticated
USING (
  -- Allow select if the client_id matches a client record associated with the user
  -- OR if the user is an admin
  EXISTS (
    SELECT 1 FROM client 
    WHERE id = staff_hiring_status.client_id 
    AND contact_person_email = auth.jwt() ->> 'email'
  )
  OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  )
);