-- =====================================================
-- Link Script: Connect Users to Sample Data
-- =====================================================
-- Run this AFTER creating user accounts through signup.
-- This connects your real users to the sample program data.

-- 1. Check what columns exist and update created_by fields
DO $$
BEGIN
  -- Update content_library if it has created_by column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_library' AND column_name = 'created_by') THEN
    UPDATE content_library 
    SET created_by = (SELECT id FROM auth.users WHERE email = 'trainer@fitiva.com')
    WHERE created_by IS NULL;
    RAISE NOTICE 'Updated content_library created_by fields';
  ELSE
    RAISE NOTICE 'content_library table does not have created_by column';
  END IF;

  -- Update programs if it has created_by column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    UPDATE programs 
    SET created_by = (SELECT id FROM auth.users WHERE email = 'trainer@fitiva.com')
    WHERE created_by IS NULL;
    RAISE NOTICE 'Updated programs created_by fields';
  ELSE
    RAISE NOTICE 'programs table does not have created_by column';
  END IF;
END $$;

-- 2. Link users to organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  au.id,
  o.id,
  (CASE 
    WHEN au.email = 'trainer@fitiva.com' THEN 'trainer'
    WHEN au.email IN ('client1@fitiva.com', 'client2@fitiva.com') THEN 'client'  
    WHEN au.email = 'manager@fitiva.com' THEN 'org_manager'
  END)::user_org_role
FROM auth.users au
CROSS JOIN organizations o
WHERE au.email IN ('trainer@fitiva.com', 'client1@fitiva.com', 'client2@fitiva.com', 'manager@fitiva.com')
  AND o.name = 'Fitiva Fitness Center'
ON CONFLICT DO NOTHING;

-- 3. Assign programs to clients (when you create client accounts)
INSERT INTO client_programs (
  client_id, program_id, assigned_by, assigned_at, start_date,
  is_active, completion_percentage, current_day, created_at, updated_at
)
SELECT 
  au.id,
  p.id,
  (SELECT id FROM auth.users WHERE email = 'trainer@fitiva.com'),
  NOW(),
  NOW(),
  true,
  CASE WHEN au.email = 'client1@fitiva.com' THEN 0.0 ELSE 15.0 END,
  1,
  NOW(),
  NOW()
FROM auth.users au
CROSS JOIN programs p  
WHERE au.email IN ('client1@fitiva.com', 'client2@fitiva.com')
  AND p.title = 'Senior Strength Foundations'
ON CONFLICT DO NOTHING;

-- 4. Add sample exercise log for client1 (when you create client accounts)
-- First check what columns exist in exercise_logs table
DO $$
DECLARE
  exercise_logs_exists boolean := false;
  has_client_program_id boolean := false;
  has_program_exercise_id boolean := false;
  has_user_id boolean := false;
  has_exercise_id boolean := false;
BEGIN
  -- Check if exercise_logs table exists
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') INTO exercise_logs_exists;
  
  IF exercise_logs_exists THEN
    -- Check what columns exist
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'client_program_id') INTO has_client_program_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'program_exercise_id') INTO has_program_exercise_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'user_id') INTO has_user_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'exercise_id') INTO has_exercise_id;
    
    RAISE NOTICE 'exercise_logs columns - client_program_id: %, program_exercise_id: %, user_id: %, exercise_id: %', 
                 has_client_program_id, has_program_exercise_id, has_user_id, has_exercise_id;
    
    -- Skip exercise log creation for now since we need to check the actual schema
    RAISE NOTICE 'Skipping exercise log creation - need to verify column names';
  ELSE
    RAISE NOTICE 'exercise_logs table does not exist';
  END IF;
END $$;

-- 5. Verify the connections
SELECT 
  'Link script complete!' as status;

-- Check content_library connections if the table has created_by
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_library' AND column_name = 'created_by') THEN
    RAISE NOTICE 'Trainer connected to % exercises', 
      (SELECT COUNT(*) FROM content_library WHERE created_by = (SELECT id FROM auth.users WHERE email = 'trainer@fitiva.com'));
  ELSE
    RAISE NOTICE 'Content library exercises: %', (SELECT COUNT(*) FROM content_library);
  END IF;
END $$;

SELECT 
  'User organizations linked: ' || COUNT(*) as user_orgs
FROM user_organizations;

SELECT 
  'Programs available: ' || COUNT(*) as programs
FROM programs;