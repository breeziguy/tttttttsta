/*
  # Create Resources Table and Schema

  1. New Tables
    - resources
      - Stores learning resources and video content
      - Tracks resource metadata and views
      - Manages content organization

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add policies for admin users

  3. Changes
    - Add resources table
    - Add initial sample content
    - Set up proper indexing
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type text NOT NULL DEFAULT 'video',
  video_url text,
  thumbnail_url text,
  category text NOT NULL,
  tags text[],
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published boolean DEFAULT false,
  view_count integer DEFAULT 0,
  
  -- Add constraints
  CONSTRAINT valid_content_type CHECK (content_type IN ('video', 'document', 'article')),
  CONSTRAINT valid_category CHECK (category IN ('training', 'guidelines', 'legal', 'faq', 'support', 'updates')),
  CONSTRAINT valid_video_url CHECK (video_url ~ '^https?://(?:www\.)?vimeo\.com/.*$' OR video_url IS NULL)
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Resources are viewable by authenticated users"
  ON resources
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Resources are manageable by admins"
  ON resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_content_type ON resources(content_type);
CREATE INDEX idx_resources_published ON resources(published);
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Create updated_at trigger
CREATE TRIGGER set_timestamp_resources
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
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
  'Staff Management Best Practices',
  'Learn essential tips and strategies for effectively managing domestic staff.',
  'video',
  'https://vimeo.com/123456789',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800',
  'training',
  ARRAY['management', 'best practices', 'staff development'],
  45,
  true
),
(
  'Understanding Employment Contracts',
  'A comprehensive guide to domestic staff employment contracts and legal requirements.',
  'video',
  'https://vimeo.com/987654321',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800',
  'legal',
  ARRAY['contracts', 'legal', 'employment'],
  30,
  true
),
(
  'Effective Communication with Staff',
  'Improve your communication skills and build better relationships with your domestic staff.',
  'video',
  'https://vimeo.com/456789123',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800',
  'training',
  ARRAY['communication', 'management', 'relationships'],
  25,
  true
),
(
  'Staff Safety Guidelines',
  'Essential safety protocols and guidelines for domestic staff and employers.',
  'video',
  'https://vimeo.com/789123456',
  'https://images.unsplash.com/photo-1581091226825-c6a89e7e4801?auto=format&fit=crop&w=800',
  'guidelines',
  ARRAY['safety', 'guidelines', 'protocols'],
  35,
  true
),
(
  'Conflict Resolution Strategies',
  'Learn how to effectively handle and resolve conflicts in a domestic staff setting.',
  'video',
  'https://vimeo.com/321654987',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800',
  'training',
  ARRAY['conflict resolution', 'management', 'communication'],
  40,
  true
);

-- Log the creation
INSERT INTO activity_log (
  activity_type,
  description,
  metadata
) VALUES (
  'resources_created',
  'Initial resources created',
  jsonb_build_object(
    'count', 5,
    'categories', ARRAY['training', 'legal', 'guidelines']
  )
);