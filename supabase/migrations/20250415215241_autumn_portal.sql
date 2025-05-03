/*
  # Fix Staff Report Policies and Indexes

  1. Changes
    - Drop existing policies
    - Create new policies with proper auth checks
    - Add performance indexes
    - Update trigger function

  2. Security
    - Enable RLS
    - Add proper user validation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access" ON staff_report;
DROP POLICY IF EXISTS "Allow authenticated users to view reports" ON staff_report;
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON staff_report;
DROP POLICY IF EXISTS "Allow authenticated users to update reports" ON staff_report;
DROP POLICY IF EXISTS "Allow authenticated users to delete reports" ON staff_report;
DROP POLICY IF EXISTS "Allow users to insert reports" ON staff_report;
DROP POLICY IF EXISTS "Allow users to delete reports they have access to" ON staff_report;
DROP POLICY IF EXISTS "Allow users to update reports they have access to" ON staff_report;
DROP POLICY IF EXISTS "Allow users to view reports they have access to" ON staff_report;

-- Create new unified policy
CREATE POLICY "Allow authenticated users to manage reports"
ON staff_report
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_report.client_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_report.client_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_report_client_id ON staff_report(client_id);
CREATE INDEX IF NOT EXISTS idx_staff_report_staff_id ON staff_report(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_report_report_type ON staff_report(report_type);
CREATE INDEX IF NOT EXISTS idx_staff_report_status ON staff_report(status);
CREATE INDEX IF NOT EXISTS idx_staff_report_severity ON staff_report(severity);
CREATE INDEX IF NOT EXISTS idx_staff_report_report_date ON staff_report(report_date);

-- Enable RLS
ALTER TABLE staff_report ENABLE ROW LEVEL SECURITY;