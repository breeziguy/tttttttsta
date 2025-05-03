/*
  # Fix RLS Policies for Activity Log and Vetting Searches

  1. Changes
    - Drop existing RLS policies
    - Add new policies with proper user validation
    - Update foreign key constraints
    - Add proper indexes

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can view their own searches" ON vetting_searches;
DROP POLICY IF EXISTS "Users can create their own searches" ON vetting_searches;

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE vetting_searches ENABLE ROW LEVEL SECURITY;

-- Create new policies for activity_log
CREATE POLICY "Enable insert for authenticated users"
ON activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM users_profile
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable select for authenticated users"
ON activity_log
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users_profile
    WHERE user_id = auth.uid()
  )
);

-- Create new policies for vetting_searches
CREATE POLICY "Enable all access for authenticated users"
ON vetting_searches
FOR ALL
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users_profile
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM users_profile
    WHERE user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_vetting_searches_user_id ON vetting_searches(user_id);

-- Update or create the vetting activity logging function
CREATE OR REPLACE FUNCTION log_vetting_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (
    user_id,
    activity_type,
    description,
    metadata
  ) VALUES (
    NEW.user_id,
    'vetting_search',
    'Performed a vetting search',
    jsonb_build_object(
      'query', NEW.search_query,
      'results_count', NEW.results_count,
      'search_date', NEW.search_date
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;