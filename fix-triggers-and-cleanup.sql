-- =====================================================
-- Fix Trigger Issues and Clean Up Test Users
-- =====================================================
-- This script fixes problematic triggers then removes test users

-- 1. First, let's see what triggers are causing issues
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%program%' OR trigger_name LIKE '%update%';

-- 2. Drop the problematic trigger temporarily (use CASCADE to remove all dependencies)
DROP TRIGGER IF EXISTS update_program_stats_trigger ON program_exercises;
DROP TRIGGER IF EXISTS update_program_stats_trigger ON program_days;
DROP TRIGGER IF EXISTS update_program_stats_on_exercise_change ON program_exercises;
DROP TRIGGER IF EXISTS update_program_stats_on_day_change ON program_days;
DROP FUNCTION IF EXISTS update_program_stats() CASCADE;

-- 3. Now let's see what users exist
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email LIKE '%fitiva.com' OR email LIKE '%@test%'
ORDER BY created_at DESC;

-- 4. Delete any existing test users (this will cascade to related tables)
DELETE FROM auth.users 
WHERE email IN (
  'trainer@fitiva.com',
  'client1@fitiva.com', 
  'client2@fitiva.com',
  'manager@fitiva.com'
);

-- 5. Also clean up any profiles that might be orphaned
DELETE FROM public.profiles 
WHERE email IN (
  'trainer@fitiva.com',
  'client1@fitiva.com',
  'client2@fitiva.com', 
  'manager@fitiva.com'
);

-- 6. Clean up any user_organizations entries
DELETE FROM public.user_organizations 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 7. Clean up any orphaned program assignments
DELETE FROM client_programs 
WHERE client_id NOT IN (SELECT id FROM auth.users);

-- 8. Recreate the trigger properly (if programs table has total_exercises column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'total_exercises'
  ) THEN
    -- Create a simpler, safer trigger
    CREATE OR REPLACE FUNCTION update_program_stats()
    RETURNS TRIGGER AS $func$
    DECLARE
      prog_id UUID;
    BEGIN
      -- Determine which program to update
      IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'program_exercises' THEN
          SELECT pd.program_id INTO prog_id
          FROM program_days pd
          WHERE pd.id = OLD.program_day_id;
        ELSIF TG_TABLE_NAME = 'program_days' THEN
          prog_id := OLD.program_id;
        END IF;
      ELSE
        IF TG_TABLE_NAME = 'program_exercises' THEN
          SELECT pd.program_id INTO prog_id
          FROM program_days pd
          WHERE pd.id = NEW.program_day_id;
        ELSIF TG_TABLE_NAME = 'program_days' THEN
          prog_id := NEW.program_id;
        END IF;
      END IF;
      
      -- Update the program stats
      IF prog_id IS NOT NULL THEN
        UPDATE programs 
        SET total_exercises = (
          SELECT COUNT(pe.id)
          FROM program_days pd
          JOIN program_exercises pe ON pe.program_day_id = pd.id
          WHERE pd.program_id = prog_id
        )
        WHERE id = prog_id;
      END IF;
      
      RETURN COALESCE(NEW, OLD);
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Create triggers only if they don't exist
    DROP TRIGGER IF EXISTS update_program_stats_trigger ON program_exercises;
    CREATE TRIGGER update_program_stats_trigger
      AFTER INSERT OR UPDATE OR DELETE ON program_exercises
      FOR EACH ROW EXECUTE FUNCTION update_program_stats();
      
    DROP TRIGGER IF EXISTS update_program_stats_trigger_days ON program_days;
    CREATE TRIGGER update_program_stats_trigger_days
      AFTER INSERT OR UPDATE OR DELETE ON program_days
      FOR EACH ROW EXECUTE FUNCTION update_program_stats();
      
    RAISE NOTICE 'Fixed and recreated program stats triggers';
  ELSE
    RAISE NOTICE 'Skipped trigger creation - programs.total_exercises column not found';
  END IF;
END $$;

-- 9. Verify cleanup
SELECT 
  'Cleanup complete! Ready for fresh signups.' as status,
  COUNT(*) as remaining_users
FROM auth.users;