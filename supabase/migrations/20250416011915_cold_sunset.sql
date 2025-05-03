-- Create staff_selections table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users_profile(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  status text DEFAULT 'selected',
  interview_date timestamptz,
  interview_notes text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_selections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow clients to manage staff selections" ON staff_selections;

-- Create new unified policy for authenticated users
CREATE POLICY "Allow clients to manage staff selections"
ON staff_selections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_selections.client_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_selections.client_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_selections_client_id 
ON staff_selections(client_id);

CREATE INDEX IF NOT EXISTS idx_staff_selections_staff_id 
ON staff_selections(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_selections_status 
ON staff_selections(status);

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp_staff_selections ON staff_selections;

-- Create updated_at trigger
CREATE TRIGGER set_timestamp_staff_selections
BEFORE UPDATE ON staff_selections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();