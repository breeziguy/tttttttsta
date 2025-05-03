/*
  # Update staff interviews foreign key constraint

  1. Changes
    - Drop existing foreign key constraint on staff_interviews table
    - Add new foreign key constraint to reference users_profile table
    - Update existing records to use correct IDs (if any exist)

  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing foreign key constraint
ALTER TABLE staff_interviews
DROP CONSTRAINT IF EXISTS staff_interviews_client_id_fkey;

-- Add new foreign key constraint to reference users_profile
ALTER TABLE staff_interviews
ADD CONSTRAINT staff_interviews_client_id_fkey
FOREIGN KEY (client_id) REFERENCES users_profile(id)
ON DELETE CASCADE;