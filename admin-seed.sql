-- Fitiva Admin Seed Script
-- Creates a platform admin user for initial setup
-- Run this in your Supabase SQL Editor after the main schema migration

-- Insert a default admin user
-- Note: This uses a secure password hash for 'FitivaAdmin2024!'
-- You can change this password after first login

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@fitiva.com',
  '$2a$10$XqXZn6LfzQ4N9QnQZV8vHO7fO.EqQkJ9GpJ3xKfQV8K2p6x8Y7Qq2', -- FitivaAdmin2024!
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Platform Admin", "role": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create the corresponding user profile
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Platform Admin',
  'admin@fitiva.com',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Confirm that the admin user was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@fitiva.com') THEN
    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Email: admin@fitiva.com';
    RAISE NOTICE 'Password: FitivaAdmin2024!';
    RAISE NOTICE 'Please change this password after first login.';
  ELSE
    RAISE NOTICE 'Admin user creation failed. Please check the logs.';
  END IF;
END $$;