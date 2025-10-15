-- Safe fix for authentication error (no destructive operations)
-- This allows the trigger to create user profiles during signup
-- Run this in your Supabase SQL Editor

-- 1. Add missing INSERT policy for users table (safe operation)
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

-- 2. Update the trigger function with proper permissions (safe operation)
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

-- 3. Create the trigger only if it doesn't exist (safe operation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_schema = 'auth'
    AND event_object_table = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE 'Trigger created successfully';
  ELSE
    RAISE NOTICE 'Trigger already exists';
  END IF;
END $$;

-- 4. Test message
DO $$
BEGIN
  RAISE NOTICE 'Safe auth fix applied successfully!';
  RAISE NOTICE 'You can now create new user accounts.';
  RAISE NOTICE 'No destructive operations were performed.';
END $$;