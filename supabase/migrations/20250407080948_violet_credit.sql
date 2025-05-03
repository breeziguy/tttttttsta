/*
  # Add initial client user

  1. Changes
    - Insert client record for existing auth user
    - Set basic client information
*/

INSERT INTO client (
  name,
  type,
  tier,
  contact_person_name,
  contact_person_email,
  contact_person_phone,
  contact_person_address,
  service_type,
  location
)
VALUES (
  'Test Client', -- Replace with your name
  'Individual',
  'C',
  'Test User', -- Replace with your name
  'lemonnadeltd@gmail.com', -- Replace with your email
  '1234567890', -- Replace with your phone
  '123 Test St', -- Replace with your address
  'Managed Services',
  'Test Location' -- Replace with your location
);