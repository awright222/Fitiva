-- Quick fix for authentication issues
-- Run this in your Supabase SQL Editor

-- 1. Temporarily disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Add missing RLS policies for user creation
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON users
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. Create a simpler function that handles user profile creation manually
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  user_role user_role DEFAULT 'client'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO users (id, name, email, role, created_at, updated_at)
  VALUES (user_id, user_name, user_email, user_role, NOW(), NOW())
  RETURNING to_jsonb(users.*) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

-- 5. Enable email confirmations to be optional (for testing)
-- Note: This should be done in Supabase Auth settings, but we can test without confirmation