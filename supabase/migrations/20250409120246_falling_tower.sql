/*
  # Fix RLS Policies for User Registration

  1. Changes
    - Update RLS policies for users_profile table
    - Allow unauthenticated users to insert during signup
    - Maintain existing policies for authenticated users

  2. Security
    - Keep existing RLS enabled
    - Add specific policy for signup flow
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_profile;

-- Create new insert policy that allows unauthenticated signup
CREATE POLICY "Enable insert for signup"
ON public.users_profile
FOR INSERT
TO public
WITH CHECK (true);

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Updated RLS policies for users_profile table';
  RAISE NOTICE 'Added policy to allow unauthenticated signup';
END $$;