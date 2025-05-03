/*
  # Fix duplicate profiles while preserving all foreign key relationships

  1. Changes
    - Update all foreign key references to point to the most recent profile
    - Remove duplicate profiles keeping most recently updated
    - Add unique constraint on user_id
*/

DO $$ 
DECLARE
  latest_profiles CURSOR FOR
    SELECT DISTINCT ON (user_id)
      id as latest_id,
      user_id
    FROM users_profile
    ORDER BY user_id, updated_at DESC, created_at DESC;
BEGIN
  -- Update activity_log references
  FOR profile_rec IN latest_profiles LOOP
    UPDATE activity_log
    SET user_id = profile_rec.latest_id
    FROM users_profile old_profile
    WHERE activity_log.user_id = old_profile.id
    AND old_profile.user_id = profile_rec.user_id
    AND old_profile.id != profile_rec.latest_id;

    -- Update staff_interviews references
    UPDATE staff_interviews
    SET client_id = profile_rec.latest_id
    FROM users_profile old_profile
    WHERE staff_interviews.client_id = old_profile.id
    AND old_profile.user_id = profile_rec.user_id
    AND old_profile.id != profile_rec.latest_id;

    -- Update staff_hiring_status references
    UPDATE staff_hiring_status
    SET client_id = profile_rec.latest_id
    FROM users_profile old_profile
    WHERE staff_hiring_status.client_id = old_profile.id
    AND old_profile.user_id = profile_rec.user_id
    AND old_profile.id != profile_rec.latest_id;

    -- Update client_subscriptions references
    UPDATE client_subscriptions
    SET client_id = profile_rec.latest_id
    FROM users_profile old_profile
    WHERE client_subscriptions.client_id = old_profile.id
    AND old_profile.user_id = profile_rec.user_id
    AND old_profile.id != profile_rec.latest_id;
  END LOOP;

  -- Now safely delete duplicate profiles
  WITH ranked_profiles AS (
    SELECT 
      id,
      user_id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY updated_at DESC, created_at DESC
      ) as rn
    FROM users_profile
  )
  DELETE FROM users_profile
  WHERE id IN (
    SELECT id 
    FROM ranked_profiles 
    WHERE rn > 1
  );

  -- Add unique constraint
  ALTER TABLE users_profile
  ADD CONSTRAINT users_profile_user_id_key UNIQUE (user_id);
END $$;