/*
  # Update Staff Skills

  1. Changes
    - Replace all existing staff skills with random combinations of new skills:
      - Literacy
      - Cooking
      - Pet Care
      - First Aid
*/

-- Create temporary function to generate random skills array
CREATE OR REPLACE FUNCTION random_skills() RETURNS text[] AS $$
DECLARE
  skills text[] := ARRAY['Literacy', 'Cooking', 'Pet Care', 'First Aid'];
  result text[] := '{}';
  skill_count integer;
  i integer;
  skill text;
BEGIN
  -- Determine random number of skills (1-4)
  skill_count := 1 + floor(random() * 4)::integer;
  
  -- Randomly select skills
  FOR i IN 1..skill_count LOOP
    -- Add a random skill that isn't already in result
    LOOP
      skill := skills[1 + floor(random() * 4)::integer];
      IF NOT skill = ANY(result) THEN
        result := array_append(result, skill);
        EXIT;
      END IF;
      -- Safety check to avoid infinite loop
      IF array_length(result, 1) >= skill_count THEN
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update all staff with random skills
UPDATE staff
SET skills = random_skills();

-- Drop the temporary function
DROP FUNCTION random_skills(); 