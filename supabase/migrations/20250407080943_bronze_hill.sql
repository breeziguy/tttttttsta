/*
  # Add initial admin user

  1. Changes
    - Insert admin user record for existing auth user
    - Set role as 'admin' and status as 'active'

  Note: Replace the user ID and email with your actual auth user details
*/

INSERT INTO admin_users (id, email, user_role, status)
VALUES (
  'da58d3d1-d578-4cd3-bb2a-a5a379271f21', -- Replace with your auth user ID
  'lemonnadeltd@gmail.com', -- Replace with your email
  'admin',
  'active'
);