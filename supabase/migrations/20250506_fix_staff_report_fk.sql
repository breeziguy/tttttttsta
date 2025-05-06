/*
  # Fix Staff Report Foreign Key Constraint

  1. Changes
    - Create a new staff_performance_insights table
    - Link it properly to users_profile instead of client
    - Set up appropriate RLS policies

  2. Security
    - Enable RLS
    - Add proper user validation
*/

-- Create new staff_performance_insights table
CREATE TABLE IF NOT EXISTS staff_performance_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES users_profile(id),
  staff_id UUID NOT NULL REFERENCES staff(id),
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policy for the new table
CREATE POLICY "Allow users to manage their performance insights"
ON staff_performance_insights
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_performance_insights.user_profile_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_performance_insights.user_profile_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_performance_insights_user_profile_id 
ON staff_performance_insights(user_profile_id);

CREATE INDEX IF NOT EXISTS idx_staff_performance_insights_staff_id 
ON staff_performance_insights(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_performance_insights_rating 
ON staff_performance_insights(rating);

CREATE INDEX IF NOT EXISTS idx_staff_performance_insights_report_date 
ON staff_performance_insights(report_date);

-- Enable RLS
ALTER TABLE staff_performance_insights ENABLE ROW LEVEL SECURITY; 