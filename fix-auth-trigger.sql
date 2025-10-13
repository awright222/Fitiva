-- Fix for user profile creation trigger
-- Run this in your Supabase SQL Editor if you encounter sign-up issues

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simpler, more robust function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user profile with better error handling
  INSERT INTO public.users (id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), -- Use email as fallback for name
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Could not create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also add a policy to allow users to insert their own profile
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure the service role can manage user profiles
GRANT ALL ON users TO service_role;