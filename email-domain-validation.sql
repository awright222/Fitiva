-- Email Domain Validation (Permissive Approach)
-- This allows most legitimate domains while blocking obvious test/fake domains
-- Run this in your Supabase SQL Editor

-- 1. Create table for blocked domains (not allowed domains)
CREATE TABLE IF NOT EXISTS public.blocked_domains (
  domain_name VARCHAR(255) PRIMARY KEY,
  reason VARCHAR(255)
);

-- 2. Insert commonly blocked test/fake domains
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

-- 3. Create a permissive domain validation function
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract domain from email
  DECLARE
    email_domain VARCHAR(255);
  BEGIN
    -- Basic email format validation
    IF NEW.email IS NULL OR NEW.email = '' OR NEW.email NOT LIKE '%@%.%' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    
    -- Extract domain (everything after @)
    email_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));
    
    -- Check if domain is in blocked list
    IF EXISTS (SELECT 1 FROM public.blocked_domains WHERE domain_name = email_domain) THEN
      RAISE EXCEPTION 'Email domain "%" is not allowed for registration', email_domain;
    END IF;
    
    -- Allow all other domains
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger on auth.users table
DROP TRIGGER IF EXISTS validate_email_domain_trigger ON auth.users;
CREATE TRIGGER validate_email_domain_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_domain();

-- 5. Test the setup
DO $$
BEGIN
  RAISE NOTICE 'Email domain validation setup complete!';
  RAISE NOTICE 'Blocked domains: example.com, test.com, and other obvious fake domains';
  RAISE NOTICE 'All legitimate business domains (gmail.com, company.com, etc.) are allowed';
END $$;