/*
  # Fix Subscription System

  1. Changes
    - Add subscription expiration trigger
    - Add subscription status check function
    - Add automatic tier update on expiration
    - Add subscription renewal tracking

  2. Security
    - Maintain existing RLS policies
*/

-- Create function to check subscription expiration
CREATE OR REPLACE FUNCTION check_subscription_expiration()
RETURNS trigger AS $$
BEGIN
  -- If subscription is expiring
  IF NEW.end_date <= CURRENT_TIMESTAMP AND NEW.is_active = true THEN
    -- Update subscription status
    NEW.is_active := false;
    
    -- Update user's subscription tier to basic
    UPDATE users_profile
    SET subscription_tier = 'basic'
    WHERE id = NEW.client_id;

    -- Log the expiration
    INSERT INTO activity_log (
      user_id,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.client_id,
      'subscription_expired',
      'Subscription expired and reverted to basic plan',
      jsonb_build_object(
        'plan_id', NEW.plan_id,
        'expired_at', NEW.end_date
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription expiration
DROP TRIGGER IF EXISTS check_subscription_expiration_trigger ON client_subscriptions;
CREATE TRIGGER check_subscription_expiration_trigger
  BEFORE UPDATE ON client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_expiration();

-- Function to get active subscription
CREATE OR REPLACE FUNCTION get_active_subscription(client_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id as subscription_id,
    cs.plan_id,
    cs.start_date,
    cs.end_date,
    cs.is_active
  FROM client_subscriptions cs
  WHERE cs.client_id = $1
    AND cs.is_active = true
    AND cs.end_date > CURRENT_TIMESTAMP
  ORDER BY cs.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add function to update user tier based on subscription
CREATE OR REPLACE FUNCTION update_user_subscription_tier()
RETURNS trigger AS $$
BEGIN
  -- Only proceed if this is a new active subscription
  IF NEW.is_active = true THEN
    -- Get the plan details
    UPDATE users_profile
    SET subscription_tier = (
      SELECT 
        CASE 
          WHEN sp.price = 0 THEN 'basic'
          WHEN sp.price <= 15000 THEN 'standard'
          ELSE 'premium'
        END
      FROM subscription_plans sp
      WHERE sp.id = NEW.plan_id
    )
    WHERE id = NEW.client_id;

    -- Log the subscription activation
    INSERT INTO activity_log (
      user_id,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.client_id,
      'subscription_activated',
      'Subscription plan activated',
      jsonb_build_object(
        'plan_id', NEW.plan_id,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription activation
DROP TRIGGER IF EXISTS update_user_subscription_tier_trigger ON client_subscriptions;
CREATE TRIGGER update_user_subscription_tier_trigger
  AFTER INSERT OR UPDATE ON client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscription_tier();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_end_date 
ON client_subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_active_status 
ON client_subscriptions(client_id, is_active, end_date);