-- ONLY run this minimal fix - do NOT run the full schema again
-- Just adds the missing INSERT policy for users table
-- Copy ONLY this content to Supabase SQL Editor

-- Add the missing INSERT policy that allows user profile creation during signup
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'users' 
    AND policyname = 'Enable insert for new user signup'
  ) THEN
    CREATE POLICY "Enable insert for new user signup" 
    ON public.users 
    FOR INSERT 
    WITH CHECK (true);
    RAISE NOTICE 'INSERT policy created for users table';
  ELSE
    RAISE NOTICE 'INSERT policy already exists for users table';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Minimal auth fix applied!';
  RAISE NOTICE 'Try creating a new user account now.';
END $$;