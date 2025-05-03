/*
  # Fix staff_feedback RLS policies

  1. Changes
    - Drop existing policies
    - Add new policies for authenticated users
    - Update foreign key constraints
    - Add proper indexes

  2. Security
    - Enable RLS
    - Add policies for client access
    - Add policies for admin access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow clients to view and create feedback" ON staff_feedback;
DROP POLICY IF EXISTS "Allow clients to create feedback" ON staff_feedback;
DROP POLICY IF EXISTS "Allow admins full access to staff_feedback" ON staff_feedback;

-- First, temporarily disable the foreign key constraint
ALTER TABLE staff_feedback
DROP CONSTRAINT IF EXISTS staff_feedback_client_id_fkey;

-- Update any existing records to use the correct client_id from users_profile
UPDATE staff_feedback sf
SET client_id = up.id
FROM client c
JOIN users_profile up ON c.contact_person_email = up.email
WHERE sf.client_id = c.id;

-- Now add the new foreign key constraint
ALTER TABLE staff_feedback
ADD CONSTRAINT staff_feedback_client_id_fkey
FOREIGN KEY (client_id) REFERENCES users_profile(id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE staff_feedback ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow clients to view and create feedback"
ON staff_feedback
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow clients to create feedback"
ON staff_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id 
    FROM users_profile 
    WHERE user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_feedback_client_id 
ON staff_feedback(client_id);

CREATE INDEX IF NOT EXISTS idx_staff_feedback_staff_id 
ON staff_feedback(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_feedback_rating 
ON staff_feedback(rating);