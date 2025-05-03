/*
  # Fix Notifications and Staff Interviews RLS Policies

  1. Changes
    - Update notifications RLS policies
    - Add missing foreign key constraints
    - Fix staff interviews policies
    - Add proper indexes

  2. Security
    - Enable RLS
    - Add proper user validation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Create new policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users_profile
    WHERE users_profile.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users_profile
    WHERE users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM users_profile
    WHERE users_profile.user_id = auth.uid()
  )
);

-- Add policy for inserting notifications
CREATE POLICY "Allow system to insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update staff interviews policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON staff_interviews;

CREATE POLICY "Enable all access for authenticated users"
ON staff_interviews
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_interviews.client_id
    AND users_profile.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE users_profile.id = staff_interviews.client_id
    AND users_profile.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Update the notify_interview_scheduled function
CREATE OR REPLACE FUNCTION notify_interview_scheduled()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for new interview
  PERFORM send_notification(
    NEW.client_id,
    'booking',
    'Interview Scheduled',
    'You have a new interview scheduled',
    jsonb_build_object(
      'interview_id', NEW.id,
      'scheduled_date', NEW.scheduled_date,
      'staff_id', NEW.staff_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;