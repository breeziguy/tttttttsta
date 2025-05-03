/*
  # Enhance Vettings Table

  1. Changes
    - Add submitted_by column to track client submissions
    - Add submission_date and vetting_status columns
    - Add staff_id reference
    - Update indexes and constraints
    - Add RLS policies

  2. Security
    - Enable RLS
    - Add policies for client access
    - Add policies for admin access
*/

-- Add new columns to vettings table
ALTER TABLE vettings
ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES users_profile(id),
ADD COLUMN IF NOT EXISTS submission_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS vetting_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';

-- Add constraint for vetting_status values
ALTER TABLE vettings
ADD CONSTRAINT valid_vetting_status 
CHECK (vetting_status IN ('pending', 'verified', 'cannot_verify'));

-- Add constraint for verification_status values
ALTER TABLE vettings
ADD CONSTRAINT valid_verification_status 
CHECK (verification_status IN ('unverified', 'verified', 'failed'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vettings_submitted_by ON vettings(submitted_by);
CREATE INDEX IF NOT EXISTS idx_vettings_submission_date ON vettings(submission_date);
CREATE INDEX IF NOT EXISTS idx_vettings_vetting_status ON vettings(vetting_status);
CREATE INDEX IF NOT EXISTS idx_vettings_verification_status ON vettings(verification_status);

-- Enable RLS
ALTER TABLE vettings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON vettings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vettings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON vettings;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON vettings
FOR SELECT
TO authenticated
USING (
  submitted_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON vettings
FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users"
ON vettings
FOR UPDATE
TO authenticated
USING (
  submitted_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
)
WITH CHECK (
  submitted_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER set_timestamp_vettings
  BEFORE UPDATE ON vettings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Log the changes
INSERT INTO activity_log (
  activity_type,
  description,
  metadata
) VALUES (
  'schema_update',
  'Enhanced vettings table with new columns and constraints',
  jsonb_build_object(
    'table', 'vettings',
    'changes', ARRAY[
      'Added submitted_by column',
      'Added submission_date column',
      'Added vetting_status column',
      'Added verification_status column',
      'Added constraints and indexes',
      'Updated RLS policies'
    ]
  )
);