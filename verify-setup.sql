-- =====================================================
-- Create Test Program and Verify Setup
-- =====================================================
-- This script creates a simple test program and verifies the setup

-- 1. Check what tables exist
SELECT 
  'Checking database tables...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('programs', 'program_days', 'program_exercises', 'content_library', 'organizations', 'user_organizations')
ORDER BY table_name;

-- 2. Check program table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'programs'
ORDER BY ordinal_position;

-- 3. Check if there are any programs
SELECT COUNT(*) as total_programs FROM programs;

-- 4. Check content_library
SELECT COUNT(*) as total_exercises FROM content_library;

-- 5. Check user_organizations
SELECT 
  au.email,
  uo.role,
  o.name as organization
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
JOIN organizations o ON o.id = uo.org_id;

-- 6. Create a simple test program manually (check columns first)
DO $$
DECLARE
  has_duration_weeks boolean := false;
  has_difficulty boolean := false;
  has_is_template boolean := false;
  has_goals boolean := false;
BEGIN
  -- Check what columns exist in programs table
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'duration_weeks') INTO has_duration_weeks;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'difficulty') INTO has_difficulty;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'is_template') INTO has_is_template;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'goals') INTO has_goals;
  
  RAISE NOTICE 'Programs table columns - duration_weeks: %, difficulty: %, is_template: %, goals: %', 
               has_duration_weeks, has_difficulty, has_is_template, has_goals;
  
  -- Insert with only columns that exist
  IF has_duration_weeks AND has_difficulty AND has_is_template THEN
    INSERT INTO programs (
      trainer_id,
      title, 
      description, 
      duration_weeks, 
      difficulty,
      is_template,
      created_at, 
      updated_at
    ) VALUES (
      '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid,
      'Test Program for Trainer',
      'A simple test program to verify the system is working',
      2,
      'beginner',
      true,
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;
  ELSE
    -- Use minimal columns that should exist including trainer_id
    INSERT INTO programs (
      trainer_id,
      title, 
      description,
      created_at, 
      updated_at
    ) VALUES (
      '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid,
      'Test Program for Trainer',
      'A simple test program to verify the system is working',
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RAISE NOTICE 'Test program created with available columns';
END $$;

-- 7. Verify the program was created
SELECT 
  id,
  trainer_id,
  title,
  description,
  created_at
FROM programs
ORDER BY created_at DESC
LIMIT 3;

-- 8. Check programs specifically for our trainer
SELECT 
  COUNT(*) as trainer_programs,
  'Programs for trainer 4505ca13-bda1-4d4f-9524-0bfea6d3516e' as description
FROM programs 
WHERE trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid;