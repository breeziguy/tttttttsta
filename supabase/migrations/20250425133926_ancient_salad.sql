-- Update vetting_status enum values
ALTER TABLE vettings
DROP CONSTRAINT IF EXISTS valid_vetting_status;

ALTER TABLE vettings
ADD CONSTRAINT valid_vetting_status 
CHECK (vetting_status IN ('submitted', 'pending', 'in_progress', 'cannot_verify'));

-- Update existing records to use new status
UPDATE vettings
SET vetting_status = 'submitted'
WHERE vetting_status = 'pending';

-- Add activity logging for status changes
CREATE OR REPLACE FUNCTION log_vetting_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.vetting_status != NEW.vetting_status THEN
    INSERT INTO activity_log (
      user_id,
      activity_type,
      description,
      metadata
    ) VALUES (
      NEW.submitted_by,
      'vetting_status_change',
      'Vetting status updated',
      jsonb_build_object(
        'old_status', OLD.vetting_status,
        'new_status', NEW.vetting_status,
        'vetting_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS log_vetting_status_change ON vettings;
CREATE TRIGGER log_vetting_status_change
  AFTER UPDATE ON vettings
  FOR EACH ROW
  WHEN (OLD.vetting_status IS DISTINCT FROM NEW.vetting_status)
  EXECUTE FUNCTION log_vetting_status_change();