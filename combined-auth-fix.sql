-- Combined Authentication Fix
-- This handles email validation AND user profile creation without conflicts
-- Run this in your Supabase SQL Editor

-- 1. First, remove the existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS validate_email_domain_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create/ensure blocked domains table exists
CREATE TABLE IF NOT EXISTS public.blocked_domains (
  domain_name VARCHAR(255) PRIMARY KEY,
  reason VARCHAR(255)
);

-- 3. Insert blocked domains (only if they don't exist)
INSERT INTO public.blocked_domains (domain_name, reason) VALUES
('example.com', 'Reserved test domain'),
('example.org', 'Reserved test domain'),
('example.net', 'Reserved test domain'),
('test.com', 'Common test domain'),
('fake.com', 'Obvious fake domain'),
('invalid.com', 'Invalid domain'),
('tempmail.com', 'Temporary email service'),
('10minutemail.com', 'Temporary email service')
ON CONFLICT (domain_name) DO NOTHING;

-- 4. Ensure the INSERT policy exists for users table
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

-- 5. Create a COMBINED function that validates email AND creates user profile
CREATE OR REPLACE FUNCTION public.handle_new_user_with_validation() 
RETURNS TRIGGER AS $$
DECLARE
  email_domain VARCHAR(255);
BEGIN
  -- Step 1: Validate email format
  IF NEW.email IS NULL OR NEW.email = '' OR NEW.email NOT LIKE '%@%.%' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Step 2: Extract and validate domain
  email_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));
  
  -- Step 3: Check if domain is blocked
  IF EXISTS (SELECT 1 FROM public.blocked_domains WHERE domain_name = email_domain) THEN
    RAISE EXCEPTION 'Email domain "%" is not allowed for registration', email_domain;
  END IF;
  
  -- Step 4: Create user profile (this was the original functionality)
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

-- 6. Create a single AFTER INSERT trigger that does everything
CREATE TRIGGER on_auth_user_created_with_validation
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_with_validation();

-- 7. Test message
DO $$
BEGIN
  RAISE NOTICE 'Combined authentication fix applied successfully!';
  RAISE NOTICE 'Email validation: Blocks fake domains, allows legitimate ones';
  RAISE NOTICE 'User creation: Creates profile in users table automatically';
  RAISE NOTICE 'Single trigger handles both validation and user creation';
END $$;