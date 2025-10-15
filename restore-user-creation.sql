-- Restore User Profile Creation
-- Run this after confirming basic auth works
-- This creates user profiles when accounts are created

-- 1. Ensure the INSERT policy exists for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable insert for new user signup'
  ) THEN
    CREATE POLICY "Enable insert for new user signup" 
    ON users 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- 2. Create user profile creation function (WITHOUT email validation for now)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create the trigger to automatically create user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Success message
DO $$
BEGIN
  RAISE NOTICE 'User profile creation trigger restored!';
  RAISE NOTICE 'New signups will automatically create profiles in users table';
END $$;