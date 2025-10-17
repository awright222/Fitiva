-- Fix RLS policies for profiles table and user_organizations join
-- Run this in Supabase SQL Editor to fix profile loading issues

-- =====================================================
-- Enable RLS on profiles table (if not already enabled)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Drop and recreate RLS policies for profiles table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Allow users to view their own profile with user_organizations data
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- Ensure user_organizations RLS policies exist
-- =====================================================

-- Enable RLS on user_organizations table (if not already enabled)
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for user_organizations
DROP POLICY IF EXISTS "Users can view own organization membership" ON user_organizations;
DROP POLICY IF EXISTS "Users can insert own organization membership" ON user_organizations;

-- Allow users to view their own organization memberships
CREATE POLICY "Users can view own organization membership" ON user_organizations
    FOR SELECT USING (auth.uid() = user_id);

-- Allow inserting organization memberships (for signup process)
CREATE POLICY "Users can insert own organization membership" ON user_organizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Create function to get user profile with role
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_profile_with_role(UUID);

-- Create function to safely get user profile with role
CREATE OR REPLACE FUNCTION get_user_profile_with_role(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    date_of_birth DATE,
    phone_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_notes TEXT
) 
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT 
        p.id,
        p.full_name,
        p.email,
        COALESCE(uo.role::TEXT, 'client') as role,
        p.created_at,
        p.updated_at,
        p.date_of_birth,
        p.phone_number,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.medical_notes
    FROM profiles p
    LEFT JOIN user_organizations uo ON p.id = uo.user_id
    WHERE p.id = user_uuid
    AND p.id = auth.uid(); -- Security check
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_with_role(UUID) TO authenticated;

-- =====================================================
-- Verify policies were created successfully
-- =====================================================

SELECT 'PROFILES TABLE POLICIES:' as info;
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

SELECT 'USER_ORGANIZATIONS TABLE POLICIES:' as info;
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_organizations'
ORDER BY policyname;

SELECT 'FUNCTION CREATED:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_profile_with_role';

SELECT 'SUCCESS: RLS policies and function created for profiles!' as result;