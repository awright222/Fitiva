-- Fitiva Admin User Creation Script
-- This script creates the admin user using Supabase's auth functions
-- Run this in your Supabase SQL Editor

-- First, let's create the admin user using the auth.users table directly
-- with a proper password hash that Supabase will recognize

-- Delete any existing admin user first (in case of conflicts)
DELETE FROM auth.users WHERE email = 'admin@fitiva.com';
DELETE FROM public.users WHERE email = 'admin@fitiva.com';

-- Create the admin user with a proper bcrypt hash
-- Password: FitivaAdmin2024!
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@fitiva.com',
  crypt('FitivaAdmin2024!', gen_salt('bf')),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"name": "Platform Admin", "role": "admin"}',
  false,
  'authenticated',
  'authenticated'
);

-- Get the user ID for the profile creation
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@fitiva.com';
  
  -- Create the user profile
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Platform Admin',
    'admin@fitiva.com',
    'admin',
    NOW(),
    NOW()
  );
  
  -- Confirmation message
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@fitiva.com';
  RAISE NOTICE 'Password: FitivaAdmin2024!';
  RAISE NOTICE 'User ID: %', admin_user_id;
END $$;