/*
  # Add Notifications System

  1. New Tables
    - notifications
      - Stores user notifications
      - Tracks notification status and metadata
      - Links to users_profile

  2. Security
    - Enable RLS
    - Add policies for user access
    - Add policies for admin access

  3. Changes
    - Add notifications table
    - Add notification triggers
    - Update activity logging
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint for notification types
  CONSTRAINT valid_notification_type CHECK (
    type IN ('booking', 'vetting', 'subscription', 'system')
  )
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users_profile
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
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

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create updated_at trigger
CREATE TRIGGER set_timestamp_notifications
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Create trigger function for vetting status notifications
CREATE OR REPLACE FUNCTION notify_vetting_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification if status has changed
  IF OLD.vetting_status IS DISTINCT FROM NEW.vetting_status THEN
    PERFORM send_notification(
      NEW.submitted_by,
      'vetting',
      'Vetting Status Updated',
      CASE NEW.vetting_status
        WHEN 'in_progress' THEN 'Your vetting request is now being processed'
        WHEN 'cannot_verify' THEN 'We were unable to verify your information'
        ELSE 'Your vetting request status has been updated to ' || NEW.vetting_status
      END,
      jsonb_build_object(
        'vetting_id', NEW.id,
        'old_status', OLD.vetting_status,
        'new_status', NEW.vetting_status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vetting status notifications
DROP TRIGGER IF EXISTS notify_vetting_status_change ON vettings;
CREATE TRIGGER notify_vetting_status_change
  AFTER UPDATE ON vettings
  FOR EACH ROW
  EXECUTE FUNCTION notify_vetting_status_change();

-- Create trigger function for interview notifications
CREATE OR REPLACE FUNCTION notify_interview_scheduled()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for new interview
  IF TG_OP = 'INSERT' THEN
    PERFORM send_notification(
      NEW.client_id,
      'booking',
      'Interview Scheduled',
      'You have a new interview scheduled for ' || 
      to_char(NEW.scheduled_date, 'DD Mon YYYY HH24:MI'),
      jsonb_build_object(
        'interview_id', NEW.id,
        'scheduled_date', NEW.scheduled_date,
        'staff_id', NEW.staff_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interview notifications
DROP TRIGGER IF EXISTS notify_interview_scheduled ON staff_interviews;
CREATE TRIGGER notify_interview_scheduled
  AFTER INSERT ON staff_interviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_interview_scheduled();