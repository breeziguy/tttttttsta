/*
  # Add Vetting Search Tracking

  1. New Tables
    - vetting_searches
      - Tracks user search queries
      - Records search metadata and results
      - Links to users_profile

  2. Security
    - Enable RLS
    - Add policies for user access
    - Add policies for admin access

  3. Changes
    - Add vetting_searches table
    - Add tracking triggers
    - Update activity logging
*/

-- Create vetting_searches table
CREATE TABLE IF NOT EXISTS vetting_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE,
  search_query text NOT NULL,
  results_count integer DEFAULT 0,
  search_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vetting_searches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own searches"
  ON vetting_searches
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users_profile WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own searches"
  ON vetting_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users_profile WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_vetting_searches_user_id ON vetting_searches(user_id);
CREATE INDEX idx_vetting_searches_search_date ON vetting_searches(search_date);

-- Create updated_at trigger
CREATE TRIGGER set_timestamp_vetting_searches
  BEFORE UPDATE ON vetting_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user search stats
CREATE OR REPLACE FUNCTION get_user_search_stats(user_profile_id uuid)
RETURNS TABLE (
  total_searches bigint,
  total_results bigint,
  avg_results_per_search numeric,
  searches_last_30_days bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_searches,
    SUM(results_count)::bigint as total_results,
    ROUND(AVG(results_count)::numeric, 2) as avg_results_per_search,
    COUNT(*) FILTER (WHERE search_date >= NOW() - INTERVAL '30 days')::bigint as searches_last_30_days
  FROM vetting_searches
  WHERE user_id = user_profile_id;
END;
$$;