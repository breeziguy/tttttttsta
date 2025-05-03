/*
  # Add Client Subscriptions

  1. New Tables
    - client_subscriptions
      - Tracks client subscription details
      - Links clients to subscription plans
      - Manages payment and subscription status

  2. Security
    - Drop existing policies
    - Enable RLS
    - Add policies for client access
    - Add policies for admin access

  3. Changes
    - Add subscription tracking
    - Add payment reference tracking
    - Add subscription status management
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow clients to view their own subscriptions" ON client_subscriptions;
DROP POLICY IF EXISTS "Allow admins full access to client_subscriptions" ON client_subscriptions;

-- Create client subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users_profile(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  payment_reference text,
  payment_status text DEFAULT 'pending',
  amount_paid numeric,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT positive_amount CHECK (amount_paid > 0)
);

-- Enable RLS
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow clients to view their own subscriptions"
  ON client_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM users_profile WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins full access to client_subscriptions"
  ON client_subscriptions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users
    )
  );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp_client_subscriptions ON client_subscriptions;

-- Create updated_at trigger
CREATE TRIGGER set_timestamp_client_subscriptions
  BEFORE UPDATE ON client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_client_subscriptions_client_id;
DROP INDEX IF EXISTS idx_client_subscriptions_plan_id;
DROP INDEX IF EXISTS idx_client_subscriptions_payment_status;
DROP INDEX IF EXISTS idx_client_subscriptions_is_active;

-- Create indexes
CREATE INDEX idx_client_subscriptions_client_id ON client_subscriptions(client_id);
CREATE INDEX idx_client_subscriptions_plan_id ON client_subscriptions(plan_id);
CREATE INDEX idx_client_subscriptions_payment_status ON client_subscriptions(payment_status);
CREATE INDEX idx_client_subscriptions_is_active ON client_subscriptions(is_active);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_active_subscription(uuid);

-- Add function to check active subscriptions
CREATE OR REPLACE FUNCTION check_active_subscription(client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM client_subscriptions
    WHERE client_subscriptions.client_id = $1
    AND is_active = true
    AND start_date <= now()
    AND (end_date IS NULL OR end_date > now())
  );
END;
$$;