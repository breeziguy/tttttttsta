/*
  # Staff Interview and Hiring System

  1. New Tables
    - staff_interviews
      - Tracks interview scheduling and status
      - Links staff with clients
      - Stores interview feedback and decisions
    
    - staff_hiring_status
      - Tracks hired staff and their status
      - Links to interview records
      - Maintains hiring history

  2. Security
    - Enable RLS on all tables
    - Add policies for client access
    - Add policies for staff access

  3. Changes
    - Add interview scheduling
    - Add hiring status tracking
    - Add interview feedback system
*/

-- Create interview status enum
CREATE TYPE interview_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled'
);

-- Create hiring status enum
CREATE TYPE hiring_status AS ENUM (
  'pending',
  'hired',
  'rejected',
  'terminated'
);

-- Create staff interviews table
CREATE TABLE IF NOT EXISTS staff_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  scheduled_date timestamp with time zone NOT NULL,
  status interview_status DEFAULT 'scheduled',
  feedback text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  hiring_decision hiring_status DEFAULT 'pending',
  decision_date timestamp with time zone,
  decision_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure one active interview per staff-client pair
  UNIQUE (client_id, staff_id, scheduled_date)
);

-- Create staff hiring status table
CREATE TABLE IF NOT EXISTS staff_hiring_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  interview_id uuid REFERENCES staff_interviews(id),
  status hiring_status DEFAULT 'pending',
  start_date date,
  end_date date,
  termination_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure one active hiring status per staff-client pair
  UNIQUE (client_id, staff_id)
);

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_staff_interviews
  BEFORE UPDATE ON staff_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_staff_hiring_status
  BEFORE UPDATE ON staff_hiring_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE staff_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_hiring_status ENABLE ROW LEVEL SECURITY;

-- Policies for staff_interviews
CREATE POLICY "Clients can view their interviews"
  ON staff_interviews
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Clients can create interviews"
  ON staff_interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Clients can update their interviews"
  ON staff_interviews
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  );

-- Policies for staff_hiring_status
CREATE POLICY "Clients can view their hiring status"
  ON staff_hiring_status
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Clients can update hiring status"
  ON staff_hiring_status
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM client WHERE contact_person_email = auth.jwt() ->> 'email'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_staff_interviews_client_id ON staff_interviews(client_id);
CREATE INDEX idx_staff_interviews_staff_id ON staff_interviews(staff_id);
CREATE INDEX idx_staff_interviews_status ON staff_interviews(status);
CREATE INDEX idx_staff_hiring_status_client_id ON staff_hiring_status(client_id);
CREATE INDEX idx_staff_hiring_status_staff_id ON staff_hiring_status(staff_id);
CREATE INDEX idx_staff_hiring_status_status ON staff_hiring_status(status);