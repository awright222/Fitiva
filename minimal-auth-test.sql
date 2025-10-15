-- Minimal Authentication Test
-- This removes ALL custom triggers temporarily to test basic Supabase auth
-- Run this in your Supabase SQL Editor

-- 1. Temporarily remove ALL our custom triggers to test basic auth
DROP TRIGGER IF EXISTS on_auth_user_created_with_validation ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS validate_email_domain_trigger ON auth.users;

-- 2. Drop our custom functions temporarily
DROP FUNCTION IF EXISTS public.handle_new_user_with_validation();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.validate_email_domain();

-- 3. Test message
DO $$
BEGIN
  RAISE NOTICE 'All custom triggers and functions removed temporarily';
  RAISE NOTICE 'Now test signup in your app with test@gmail.com';
  RAISE NOTICE 'This will tell us if the issue is our triggers or Supabase settings';
END $$;