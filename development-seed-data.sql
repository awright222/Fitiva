-- =====================================================
-- Fitiva Development Seed Data
-- =====================================================
-- This script creates test accounts, relationships, and sample content
-- for development and testing of the Fitiva fitness app.
--
-- WHAT THIS CREATES:
-- 1. Test user accounts (trainer, clients, org_manager)
-- 2. Organization structure
-- 3. Trainer-client relationships  
-- 4. Sample exercises in content_library
-- 5. Sample programs and assignments
-- 6. Test exercise logs for progress tracking
--
-- Run this in your Supabase SQL Editor AFTER:
-- - content-library-schema-complete.sql
-- - supabase-storage-setup.sql
-- =====================================================

-- =====================================================
-- 1. CREATE TEST ORGANIZATION
-- =====================================================

-- Insert test organization (check ID type first)
DO $$
DECLARE
  org_id_type varchar;
BEGIN
  -- Check if organizations.id is uuid or integer
  SELECT data_type INTO org_id_type 
  FROM information_schema.columns 
  WHERE table_name = 'organizations' AND column_name = 'id';
  
  RAISE NOTICE 'organizations.id type: %', org_id_type;
  
  -- Insert with appropriate ID handling
  IF org_id_type = 'uuid' THEN
    INSERT INTO organizations (name, created_at, updated_at)
    VALUES ('Fitiva Fitness Center', NOW(), NOW());
  ELSE
    -- For integer IDs, let it auto-increment
    INSERT INTO organizations (name, created_at, updated_at)
    VALUES ('Fitiva Fitness Center', NOW(), NOW());
  END IF;
END $$;

-- =====================================================
-- 2. CREATE TEST USER ACCOUNTS 
-- =====================================================
-- NOTE: These use placeholder passwords. In production, users sign up normally.

-- Create Trainer Account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'trainer@fitiva.com',
  '$2a$10$XqXZn6LfzQ4N9QnQZV8vHO7fO.EqQkJ9GpJ3xKfQV8K2p6x8Y7Qq2', -- Password: FitivaTrainer2024!
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Sarah Johnson", "role": "trainer"}',
  false,
  'authenticated'
);

-- Create Client Account 1
INSERT INTO auth.users (
  id,
  instance_id, 
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'client1@fitiva.com',
  '$2a$10$XqXZn6LfzQ4N9QnQZV8vHO7fO.EqQkJ9GpJ3xKfQV8K2p6x8Y7Qq2', -- Password: FitivaClient2024!
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Robert Smith", "role": "client"}',
  false,
  'authenticated'
);

-- Create Client Account 2
INSERT INTO auth.users (
  id,
  instance_id,
  email, 
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'client2@fitiva.com', 
  '$2a$10$XqXZn6LfzQ4N9QnQZV8vHO7fO.EqQkJ9GpJ3xKfQV8K2p6x8Y7Qq2', -- Password: FitivaClient2024!
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Mary Wilson", "role": "client"}',
  false,
  'authenticated'
);

-- Create Organization Manager Account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password, 
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'manager@fitiva.com',
  '$2a$10$XqXZn6LfzQ4N9QnQZV8vHO7fO.EqQkJ9GpJ3xKfQV8K2p6x8Y7Qq2', -- Password: FitivaManager2024!
  NOW(),
  NOW(),
  NOW(),
  '{"name": "David Brown", "role": "org_manager"}',
  false,
  'authenticated'
);

-- =====================================================
-- 3. CREATE USER ORGANIZATION RELATIONSHIPS
-- =====================================================

-- Add trainer to organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  o.id,
  'trainer'
FROM organizations o 
WHERE o.name = 'Fitiva Fitness Center';

-- Add clients to organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  unnest(ARRAY['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'])::uuid,
  o.id,
  'client'
FROM organizations o 
WHERE o.name = 'Fitiva Fitness Center';

-- Add manager to organization  
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  '55555555-5555-5555-5555-555555555555',
  o.id,
  'org_manager'
FROM organizations o 
WHERE o.name = 'Fitiva Fitness Center';

-- =====================================================
-- 4. CREATE SAMPLE EXERCISES
-- =====================================================

-- Only create if content_library table exists and has required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_library' AND column_name = 'created_by') THEN
    
    -- Insert sample exercises
    INSERT INTO content_library (
      title, description, category, muscle_groups, difficulty, 
      equipment, type, is_global, created_by, created_at
    ) VALUES 
    ('Push-ups', 'Classic bodyweight exercise targeting chest, shoulders, and triceps. Great for building upper body strength.', 
     'strength', ARRAY['chest', 'shoulders', 'triceps'], 'beginner', 
     ARRAY['bodyweight'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Bodyweight Squats', 'Fundamental lower body exercise that strengthens legs and glutes. Perfect for seniors starting their fitness journey.',
     'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'beginner',
     ARRAY['bodyweight'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Seated Row with Resistance Band', 'Excellent back and bicep exercise that can be done safely from a chair. Great for posture improvement.',
     'strength', ARRAY['back', 'biceps'], 'beginner', 
     ARRAY['resistance_bands'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Wall Angels', 'Gentle shoulder mobility exercise performed against a wall. Helps improve posture and shoulder flexibility.',
     'mobility', ARRAY['shoulders', 'upper_back'], 'beginner',
     ARRAY['none'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Chair-Assisted Lunges', 'Modified lunges using a chair for balance and support. Builds leg strength while maintaining safety.',
     'strength', ARRAY['quadriceps', 'glutes', 'calves'], 'intermediate',
     ARRAY['chair'], 'exercise', false, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Gentle March in Place', 'Low-impact cardio exercise that can be done anywhere. Great warm-up or light cardio option.',
     'cardio', ARRAY['full_body'], 'beginner',
     ARRAY['bodyweight'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Seated Spinal Twist', 'Gentle core and back mobility exercise done from a chair. Improves spinal flexibility.',
     'flexibility', ARRAY['core', 'lower_back'], 'beginner',
     ARRAY['chair'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW()),
     
    ('Modified Plank', 'Core strengthening exercise that can be done on knees or against a wall for different difficulty levels.',
     'strength', ARRAY['core', 'shoulders'], 'intermediate', 
     ARRAY['bodyweight'], 'exercise', true, '22222222-2222-2222-2222-222222222222', NOW());
     
    RAISE NOTICE 'Created sample exercises in content_library';
  ELSE
    RAISE NOTICE 'Skipped exercises creation - content_library table or columns missing';
  END IF;
END $$;

-- =====================================================
-- 5. CREATE SAMPLE PROGRAMS
-- =====================================================

-- Only create if programs table exists and has required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    
    -- Insert Beginner Program
    INSERT INTO programs (
      id, title, description, created_by, duration_weeks, difficulty, 
      is_template, goals, created_at, updated_at
    ) VALUES (
      '66666666-6666-6666-6666-666666666666',
      'Senior Strength Foundations',
      'A gentle 4-week program designed specifically for seniors beginning their fitness journey. Focuses on building basic strength, improving balance, and enhancing daily functional movement.',
      '22222222-2222-2222-2222-222222222222',
      4,
      'beginner', 
      true,
      ARRAY['strength_building', 'balance', 'functional_movement'],
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created sample program: Senior Strength Foundations';
  ELSE
    RAISE NOTICE 'Skipped programs creation - programs table or columns missing';
  END IF;
END $$;

-- =====================================================  
-- 6. CREATE PROGRAM DAYS
-- =====================================================

-- Only create if program_days table exists
DO $$
DECLARE
  has_title boolean := false;
  has_description boolean := false;
  has_is_rest_day boolean := false;
  has_created_at boolean := false;
  id_type varchar;
  program_id_type varchar;
  insert_sql text;
  values_sql text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') THEN
    
    -- Check what columns actually exist and their types
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'title') INTO has_title;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'description') INTO has_description;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'is_rest_day') INTO has_is_rest_day;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'created_at') INTO has_created_at;
    
    -- Check ID types
    SELECT data_type INTO id_type FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'id';
    SELECT data_type INTO program_id_type FROM information_schema.columns WHERE table_name = 'program_days' AND column_name = 'program_id';
    
    RAISE NOTICE 'program_days - id type: %, program_id type: %', id_type, program_id_type;
    RAISE NOTICE 'program_days columns - title: %, description: %, is_rest_day: %, created_at: %', 
                 has_title, has_description, has_is_rest_day, has_created_at;
    
    -- Use different approach based on ID type
    IF id_type = 'integer' THEN
      -- For integer IDs, let them auto-increment by not specifying ID
      insert_sql := 'INSERT INTO program_days (program_id, day_number';
      
      IF has_title THEN
        insert_sql := insert_sql || ', title';
      END IF;
      IF has_description THEN
        insert_sql := insert_sql || ', description';
      END IF;
      IF has_is_rest_day THEN
        insert_sql := insert_sql || ', is_rest_day';
      END IF;
      IF has_created_at THEN
        insert_sql := insert_sql || ', created_at';
      END IF;
      
      insert_sql := insert_sql || ') VALUES ';
      
      -- Get the program ID (could be integer or UUID)
      IF program_id_type = 'integer' THEN
        -- Day 1
        values_sql := '((SELECT id FROM programs WHERE title = ''Senior Strength Foundations''), 1';
      ELSE
        values_sql := '(''66666666-6666-6666-6666-666666666666'', 1';
      END IF;
      
      IF has_title THEN
        values_sql := values_sql || ', ''Upper Body Strength''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Focus on building upper body strength with safe, controlled movements.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', false';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || '), ';
      
      -- Day 2
      IF program_id_type = 'integer' THEN
        values_sql := values_sql || '((SELECT id FROM programs WHERE title = ''Senior Strength Foundations''), 2';
      ELSE
        values_sql := values_sql || '(''66666666-6666-6666-6666-666666666666'', 2';
      END IF;
      
      IF has_title THEN
        values_sql := values_sql || ', ''Lower Body & Balance''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Strengthen legs and improve balance for daily activities.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', false';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || '), ';
      
      -- Day 3
      IF program_id_type = 'integer' THEN
        values_sql := values_sql || '((SELECT id FROM programs WHERE title = ''Senior Strength Foundations''), 3';
      ELSE
        values_sql := values_sql || '(''66666666-6666-6666-6666-666666666666'', 3';
      END IF;
      
      IF has_title THEN
        values_sql := values_sql || ', ''Active Recovery''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Gentle mobility and flexibility work to aid recovery.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', true';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || ')';
      
    ELSE
      -- For UUID IDs, use the original approach
      insert_sql := 'INSERT INTO program_days (id, program_id, day_number';
      values_sql := ' VALUES ';
      
      IF has_title THEN
        insert_sql := insert_sql || ', title';
      END IF;
      IF has_description THEN
        insert_sql := insert_sql || ', description';
      END IF;
      IF has_is_rest_day THEN
        insert_sql := insert_sql || ', is_rest_day';
      END IF;
      IF has_created_at THEN
        insert_sql := insert_sql || ', created_at';
      END IF;
      
      insert_sql := insert_sql || ')';
      
      -- Day 1
      values_sql := values_sql || '(''77777777-7777-7777-7777-777777777777'', ''66666666-6666-6666-6666-666666666666'', 1';
      IF has_title THEN
        values_sql := values_sql || ', ''Upper Body Strength''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Focus on building upper body strength with safe, controlled movements.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', false';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || '), ';
      
      -- Continue with other days...
      values_sql := values_sql || '(''88888888-8888-8888-8888-888888888888'', ''66666666-6666-6666-6666-666666666666'', 2';
      IF has_title THEN
        values_sql := values_sql || ', ''Lower Body & Balance''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Strengthen legs and improve balance for daily activities.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', false';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || '), ';
      
      values_sql := values_sql || '(''99999999-9999-9999-9999-999999999999'', ''66666666-6666-6666-6666-666666666666'', 3';
      IF has_title THEN
        values_sql := values_sql || ', ''Active Recovery''';
      END IF;
      IF has_description THEN
        values_sql := values_sql || ', ''Gentle mobility and flexibility work to aid recovery.''';
      END IF;
      IF has_is_rest_day THEN
        values_sql := values_sql || ', true';
      END IF;
      IF has_created_at THEN
        values_sql := values_sql || ', NOW()';
      END IF;
      values_sql := values_sql || ')';
    END IF;
    
    -- Execute the dynamic SQL
    EXECUTE insert_sql || values_sql;
     
    RAISE NOTICE 'Created program days for Senior Strength Foundations';
  ELSE
    RAISE NOTICE 'Skipped program days creation - table missing';  
  END IF;
END $$;

-- =====================================================
-- 7. CREATE PROGRAM EXERCISES
-- =====================================================

-- Only create if program_exercises table exists
DO $$
DECLARE
  has_exercise_order boolean := false;
  has_sets boolean := false;
  has_reps boolean := false;
  has_rest_seconds boolean := false;
  has_notes boolean := false;
  program_day_id_type varchar;
  day1_id text;
  day2_id text;
  day3_id text;
BEGIN
  -- Temporarily disable triggers to avoid issues with trigger functions
  SET session_replication_role = replica;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') THEN
    
    -- Check what columns exist in program_exercises
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'exercise_order') INTO has_exercise_order;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'sets') INTO has_sets;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'reps') INTO has_reps;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'rest_seconds') INTO has_rest_seconds;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'notes') INTO has_notes;
    
    -- Check ID type
    SELECT data_type INTO program_day_id_type FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'program_day_id';
    
    RAISE NOTICE 'program_exercises columns - exercise_order: %, sets: %, reps: %, rest_seconds: %, notes: %', 
                 has_exercise_order, has_sets, has_reps, has_rest_seconds, has_notes;
    RAISE NOTICE 'program_exercises - program_day_id type: %', program_day_id_type;
    
    -- Get the program_day IDs (they could be integers or UUIDs)
    IF program_day_id_type = 'integer' THEN
      -- For integer IDs, get the actual generated IDs
      SELECT id::text INTO day1_id FROM program_days WHERE day_number = 1 AND program_id = (SELECT id FROM programs WHERE title = 'Senior Strength Foundations') LIMIT 1;
      SELECT id::text INTO day2_id FROM program_days WHERE day_number = 2 AND program_id = (SELECT id FROM programs WHERE title = 'Senior Strength Foundations') LIMIT 1;
      SELECT id::text INTO day3_id FROM program_days WHERE day_number = 3 AND program_id = (SELECT id FROM programs WHERE title = 'Senior Strength Foundations') LIMIT 1;
    ELSE
      -- For UUID IDs, use the hardcoded values
      day1_id := '77777777-7777-7777-7777-777777777777';
      day2_id := '88888888-8888-8888-8888-888888888888';
      day3_id := '99999999-9999-9999-9999-999999999999';
    END IF;
    
    RAISE NOTICE 'Using program_day IDs - day1: %, day2: %, day3: %', day1_id, day2_id, day3_id;
    
    -- Only insert basic required columns: program_day_id and exercise_id
    -- Use separate logic for integer vs UUID types
    IF program_day_id_type = 'integer' THEN
      -- For integer IDs
      -- Day 1: Upper Body Strength - Push-ups
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day1_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Push-ups' LIMIT 1;
      
      -- Day 1: Seated Row
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day1_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Seated Row with Resistance Band' LIMIT 1;
      
      -- Day 2: Lower Body & Balance - Squats
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day2_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Bodyweight Squats' LIMIT 1;
      
      -- Day 2: Lunges
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day2_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Chair-Assisted Lunges' LIMIT 1;
      
      -- Day 3: Active Recovery - March in Place
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day3_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Gentle March in Place' LIMIT 1;
      
      -- Day 3: Spinal Twist
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day3_id::integer, cl.id
      FROM content_library cl WHERE cl.title = 'Seated Spinal Twist' LIMIT 1;
      
    ELSE
      -- For UUID IDs
      -- Day 1: Upper Body Strength - Push-ups
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day1_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Push-ups' LIMIT 1;
      
      -- Day 1: Seated Row
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day1_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Seated Row with Resistance Band' LIMIT 1;
      
      -- Day 2: Lower Body & Balance - Squats
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day2_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Bodyweight Squats' LIMIT 1;
      
      -- Day 2: Lunges
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day2_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Chair-Assisted Lunges' LIMIT 1;
      
      -- Day 3: Active Recovery - March in Place
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day3_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Gentle March in Place' LIMIT 1;
      
      -- Day 3: Spinal Twist
      INSERT INTO program_exercises (program_day_id, exercise_id)
      SELECT day3_id::uuid, cl.id
      FROM content_library cl WHERE cl.title = 'Seated Spinal Twist' LIMIT 1;
      
    END IF;
    
    RAISE NOTICE 'Created program exercises for all days';
  ELSE
    RAISE NOTICE 'Skipped program exercises creation - required tables missing';
  END IF;
  
  -- Re-enable triggers
  SET session_replication_role = DEFAULT;
END $$;

-- =====================================================
-- 8. ASSIGN PROGRAMS TO CLIENTS
-- =====================================================

-- Only create if client_programs table exists
DO $$
DECLARE
  program_id_type varchar;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') THEN
    
    -- Check what type program_id is
    SELECT data_type INTO program_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'client_programs' AND column_name = 'program_id';
    
    RAISE NOTICE 'client_programs.program_id type: %', program_id_type;
    
    -- Assign program to both test clients with appropriate ID handling
    IF program_id_type = 'integer' THEN
      -- For integer program_id, get the actual program ID
      INSERT INTO client_programs (
        client_id, program_id, assigned_by, assigned_at, start_date, 
        is_active, completion_percentage, current_day, created_at, updated_at
      )
      SELECT 
        unnest(ARRAY['33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'])::uuid,
        p.id,
        '22222222-2222-2222-2222-222222222222'::uuid,
        NOW(),
        NOW(),
        true,
        CASE WHEN row_number() OVER() = 1 THEN 0.0 ELSE 15.0 END,
        1,
        NOW(),
        NOW()
      FROM programs p 
      WHERE p.title = 'Senior Strength Foundations';
    ELSE
      -- For UUID program_id, use the hardcoded UUID
      INSERT INTO client_programs (
        client_id, program_id, assigned_by, assigned_at, start_date, 
        is_active, completion_percentage, current_day, created_at, updated_at
      ) VALUES 
      ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 
       '22222222-2222-2222-2222-222222222222', NOW(), NOW(), 
       true, 0.0, 1, NOW(), NOW()),
       
      ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666',
       '22222222-2222-2222-2222-222222222222', NOW(), NOW(),
       true, 15.0, 1, NOW(), NOW());
    END IF;
    
    RAISE NOTICE 'Assigned program to test clients';
  ELSE  
    RAISE NOTICE 'Skipped client assignments - client_programs table missing';
  END IF;
END $$;

-- =====================================================
-- 9. CREATE SAMPLE EXERCISE LOGS
-- =====================================================

-- Only create if exercise_logs table exists
DO $$
DECLARE
  client_program_count integer;
  program_exercise_count integer;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') THEN
    
    -- Check if we have the related data first
    SELECT COUNT(*) INTO client_program_count FROM client_programs WHERE client_id = '33333333-3333-3333-3333-333333333333';
    SELECT COUNT(*) INTO program_exercise_count FROM program_exercises;
    
    RAISE NOTICE 'Found % client_programs and % program_exercises for exercise logs', client_program_count, program_exercise_count;
    
    IF client_program_count > 0 AND program_exercise_count > 0 THEN
      -- Add some sample workout completion data for Client 1
      -- This would normally be created when clients complete workouts
      INSERT INTO exercise_logs (
        client_program_id, program_exercise_id, completed_at, 
        actual_sets, actual_reps, notes, created_at
      )
      SELECT 
        cp.id,
        pe.id,
        NOW() - INTERVAL '2 days',
        2,
        '10',
        'Felt good, could probably do more next time',
        NOW() - INTERVAL '2 days'
      FROM client_programs cp
      JOIN programs p ON p.id = cp.program_id
      JOIN program_days pd ON pd.program_id = p.id
      JOIN program_exercises pe ON pe.program_day_id = pd.id
      WHERE cp.client_id = '33333333-3333-3333-3333-333333333333'
      LIMIT 1;
      
      RAISE NOTICE 'Created sample exercise logs'; 
    ELSE
      RAISE NOTICE 'Skipped exercise logs creation - no client_programs or program_exercises found';
    END IF;
  ELSE
    RAISE NOTICE 'Skipped exercise logs creation - table missing';
  END IF;
END $$;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Show what was created
DO $$
BEGIN
  RAISE NOTICE '=== SEED DATA SUMMARY ===';
  RAISE NOTICE 'Organizations: %', (SELECT COUNT(*) FROM organizations WHERE name = 'Fitiva Fitness Center');
  RAISE NOTICE 'Test Users: %', (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%fitiva.com');
  RAISE NOTICE 'User-Org Relationships: %', (SELECT COUNT(*) FROM user_organizations);
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') THEN
    RAISE NOTICE 'Sample Exercises: %', (SELECT COUNT(*) FROM content_library);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    RAISE NOTICE 'Sample Programs: %', (SELECT COUNT(*) FROM programs);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') THEN  
    RAISE NOTICE 'Client Assignments: %', (SELECT COUNT(*) FROM client_programs);
  END IF;
END $$;

-- =====================================================
-- DONE!
-- =====================================================
-- 
-- TEST ACCOUNTS CREATED:
-- ====================
-- 
-- Trainer: trainer@fitiva.com / FitivaTrainer2024!
-- Client 1: client1@fitiva.com / FitivaClient2024!  
-- Client 2: client2@fitiva.com / FitivaClient2024!
-- Manager: manager@fitiva.com / FitivaManager2024!
--
-- All accounts are linked to "Fitiva Fitness Center" organization
-- Clients are assigned to the "Senior Strength Foundations" program
-- Sample exercises and workout data are available for testing
--
-- You can now:
-- 1. Log in as trainer to see content library and programs
-- 2. Log in as clients to see assigned programs  
-- 3. Test the full trainer-client workflow
-- =====================================================