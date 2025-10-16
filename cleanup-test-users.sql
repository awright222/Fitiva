-- =====================================================
-- Clean Up Test Users and Start Fresh
-- =====================================================
-- This script removes any existing test users so you can 
-- create new ones without conflicts

-- 1. First, let's see what users exist
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email LIKE '%fitiva.com' OR email LIKE '%@test%'
ORDER BY created_at DESC;

-- 2. Delete any existing test users (this will cascade to related tables)
DELETE FROM auth.users 
WHERE email IN (
  'trainer@fitiva.com',
  'client1@fitiva.com', 
  'client2@fitiva.com',
  'manager@fitiva.com'
);

-- 3. Also clean up any profiles that might be orphaned
DELETE FROM public.profiles 
WHERE email IN (
  'trainer@fitiva.com',
  'client1@fitiva.com',
  'client2@fitiva.com', 
  'manager@fitiva.com'
);

-- 4. Clean up any user_organizations entries
DELETE FROM public.user_organizations 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 5. Verify cleanup
SELECT 
  'Cleanup complete! Ready for fresh signups.' as status,
  COUNT(*) as remaining_users
FROM auth.users;