/*
  # Add Vetting Resources and Update Activity Logging

  1. Changes
    - Add vetting category to resources table
    - Insert vetting-related resources
    - Update activity logging for vetting actions

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access controls
*/

-- First update the valid_category constraint to include vetting
ALTER TABLE resources
DROP CONSTRAINT IF EXISTS valid_category;

ALTER TABLE resources
ADD CONSTRAINT valid_category 
CHECK (category IN ('training', 'guidelines', 'legal', 'faq', 'support', 'updates', 'vetting'));

-- Insert vetting-related resources
INSERT INTO resources (
  title,
  description,
  content_type,
  video_url,
  thumbnail_url,
  category,
  tags,
  duration_minutes,
  published
) VALUES 
(
  'Understanding Background Checks',
  'Learn about the importance of thorough background checks and verification processes.',
  'video',
  'https://vimeo.com/123456789',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800',
  'vetting',
  ARRAY['background checks', 'verification', 'security'],
  30,
  true
),
(
  'Document Verification Best Practices',
  'A comprehensive guide to verifying identification and employment documents.',
  'video',
  'https://vimeo.com/234567890',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800',
  'vetting',
  ARRAY['documents', 'verification', 'compliance'],
  25,
  true
),
(
  'Red Flags in Staff Vetting',
  'Learn to identify warning signs and potential issues during the vetting process.',
  'video',
  'https://vimeo.com/345678901',
  'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=800',
  'vetting',
  ARRAY['security', 'screening', 'risk management'],
  35,
  true
);

-- Create a function to log vetting activities
CREATE OR REPLACE FUNCTION log_vetting_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (
    user_id,
    activity_type,
    description,
    metadata
  ) VALUES (
    NEW.user_id,
    'vetting_search',
    'Performed a vetting search',
    jsonb_build_object(
      'query', NEW.search_query,
      'results_count', NEW.results_count,
      'search_date', NEW.search_date
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vetting searches
DROP TRIGGER IF EXISTS log_vetting_search ON vetting_searches;
CREATE TRIGGER log_vetting_search
  AFTER INSERT ON vetting_searches
  FOR EACH ROW
  EXECUTE FUNCTION log_vetting_activity();