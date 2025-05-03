/*
  # Reset user subscription tier

  1. Changes
    - Update users_profile table to set subscription_tier to 'basic'
    - Add activity log entry for subscription change
*/

-- Update all users to basic plan
UPDATE users_profile
SET subscription_tier = 'basic'
WHERE subscription_tier IS NOT NULL;

-- Create activity log if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id),
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own activity"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users_profile WHERE user_id = auth.uid()
  ));

-- Log subscription reset
INSERT INTO activity_log (
  user_id,
  activity_type,
  description,
  metadata
)
SELECT 
  id,
  'subscription_reset',
  'Subscription reset to Basic Plan',
  jsonb_build_object(
    'previous_tier', subscription_tier,
    'new_tier', 'basic'
  )
FROM users_profile
WHERE subscription_tier IS NOT NULL;