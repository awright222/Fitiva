-- Database Diagnostic Script
-- Run this to understand the current state and identify issues
-- Run this in your Supabase SQL Editor

-- 1. Check what triggers currently exist on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 2. Check what functions exist for user handling
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%';

-- 3. Check current policies on users table
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Check if blocked_domains table exists and what's in it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_domains' AND table_schema = 'public') THEN
    RAISE NOTICE 'blocked_domains table exists';
    -- Show contents
    PERFORM pg_notify('debug', 'Blocked domains: ' || (SELECT string_agg(domain_name, ', ') FROM public.blocked_domains));
  ELSE
    RAISE NOTICE 'blocked_domains table does NOT exist';
  END IF;
END $$;

-- 5. Check users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Test email validation function directly (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user_with_validation' AND routine_schema = 'public') THEN
    RAISE NOTICE 'handle_new_user_with_validation function exists';
  ELSE
    RAISE NOTICE 'handle_new_user_with_validation function does NOT exist';
  END IF;
END $$;

-- 7. Simple test to see if we can manually insert into users table
DO $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, name, email, role) 
    VALUES ('test-id-123', 'Test User', 'test@gmail.com', 'client');
    RAISE NOTICE 'Manual insert into users table: SUCCESS';
    -- Clean up
    DELETE FROM public.users WHERE id = 'test-id-123';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Manual insert into users table: FAILED - %', SQLERRM;
  END;
END $$;