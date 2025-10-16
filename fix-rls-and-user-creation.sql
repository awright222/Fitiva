-- ===============================================
-- COMPREHENSIVE FIX FOR SUPABASE AUTH & RLS ISSUES  
-- ===============================================
-- Run this in your Supabase SQL Editor

-- 1. First, add missing INSERT policy for user creation
CREATE POLICY "Enable insert for authentication triggers" ON public.users
FOR INSERT WITH CHECK (true);

-- 2. Create function to handle user creation (with better error handling)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email::text),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just continue
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error and continue (don't block auth)
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix existing users who might be missing profiles
-- This will create user records for any authenticated users who don't have profiles
INSERT INTO public.users (id, name, email, role, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email::text) as name,
  au.email,
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'trainer'::user_role) as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL;

-- 5. Verify the fix worked
SELECT 
  'Auth Users' as table_name, 
  count(*) as count 
FROM auth.users 
WHERE email IS NOT NULL

UNION ALL

SELECT 
  'Profile Users' as table_name, 
  count(*) as count 
FROM public.users;

-- 6. Show any users still missing profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  'Missing profile' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL;