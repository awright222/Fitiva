-- =====================================================
-- Debug Profile and User Data Issues
-- =====================================================
-- Check what got created and fix any data problems

-- 1. Check what users were created
SELECT 
  id, 
  email, 
  raw_user_meta_data,
  created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check what profiles exist
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there are any other user-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%user%'
ORDER BY table_name;

-- 4. Fix the profile for the trainer account
UPDATE public.profiles 
SET 
  full_name = 'Trainer User',
  role = 'trainer'
WHERE email = 'trainer@fitiva.com';

-- 5. Check the result
SELECT 
  'Profile updated for trainer' as status,
  id,
  email,
  full_name,
  role
FROM public.profiles
WHERE email = 'trainer@fitiva.com';