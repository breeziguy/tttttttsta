/*
  # User Profile Schema Setup

  1. New Tables
    - `users_profile`
      - Stores additional user information
      - Links to auth.users via user_id
      - Includes personal and business details
      - Handles both individual and corporate profiles

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data

  3. Changes
    - Add user profile table
    - Add RLS policies
    - Add triggers for profile management
*/

-- Create enum for account types
CREATE TYPE account_type AS ENUM ('individual', 'corporate');

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'enterprise');

-- Create users_profile table
CREATE TABLE IF NOT EXISTS public.users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  address text,
  account_type account_type NOT NULL DEFAULT 'individual',
  company_name text,
  business_address text,
  subscription_tier subscription_tier DEFAULT 'basic',
  is_profile_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Additional fields for verification and status
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  account_status text DEFAULT 'active',
  
  -- Business/Company specific fields
  registration_number text,
  tax_id text,
  industry text,
  
  -- Preferences and settings
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  subscription_settings jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT email_length CHECK (char_length(email) >= 5),
  CONSTRAINT phone_format CHECK (phone_number ~ '^[0-9+\-\s]*$')
);

-- Enable RLS
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to check profile completion
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required fields are filled
  NEW.is_profile_complete := (
    NEW.full_name IS NOT NULL AND
    NEW.phone_number IS NOT NULL AND
    NEW.address IS NOT NULL AND
    CASE 
      WHEN NEW.account_type = 'corporate' THEN
        NEW.company_name IS NOT NULL AND
        NEW.business_address IS NOT NULL
      ELSE 
        true
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON public.users_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_completion();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_profile_user_id ON public.users_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON public.users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_account_type ON public.users_profile(account_type);

-- Grant necessary permissions
GRANT ALL ON TABLE public.users_profile TO authenticated;
GRANT ALL ON TABLE public.users_profile TO service_role;

-- Comments
COMMENT ON TABLE public.users_profile IS 'Stores additional user profile information beyond auth data';
COMMENT ON COLUMN public.users_profile.user_id IS 'References the auth.users id';
COMMENT ON COLUMN public.users_profile.is_profile_complete IS 'Automatically calculated based on required fields';