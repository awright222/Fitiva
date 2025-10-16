-- =====================================================
-- Fitiva Content Library Schema Updates
-- =====================================================
-- This file contains all the database schema changes needed
-- for the content library and program builder features.
--
-- Run this in your Supabase SQL Editor or via migrations
-- =====================================================
-- Debug: Check what tables and columns exist at start
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Tables that exist at start:';
  RAISE NOTICE '- organizations: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations'));
  RAISE NOTICE '- content_library: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library'));
  RAISE NOTICE '- programs: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs'));
  RAISE NOTICE '- program_days: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days'));
  RAISE NOTICE '- program_exercises: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises'));
  
  -- Check existing programs table structure if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    RAISE NOTICE 'Existing programs table structure:';
    RAISE NOTICE '- programs.id type: %', (SELECT data_type FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'id');
    RAISE NOTICE '- programs.created_by exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by'));
    RAISE NOTICE '- programs.organization_id exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'organization_id'));
    RAISE NOTICE '- programs.org_id exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'org_id'));
  END IF;
  
  -- Check existing content_library structure if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') THEN
    RAISE NOTICE 'Existing content_library table structure:';
    RAISE NOTICE '- content_library.id type: %', (SELECT data_type FROM information_schema.columns WHERE table_name = 'content_library' AND column_name = 'id');
    RAISE NOTICE '- content_library.created_by exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_library' AND column_name = 'created_by'));
  END IF;
END $$;

-- =====================================================
-- 0. CREATE ORGANIZATIONS TABLE IF NEEDED
-- =====================================================
-- Create organizations table if it doesn't exist (for multi-tenant support)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar UNIQUE,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role varchar DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);

-- =====================================================
-- 1. UPDATE CONTENT_LIBRARY TABLE
-- =====================================================
-- Check current content_library structure
DO $$
DECLARE
    col_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='created_by'
    ) INTO col_exists;
    
    RAISE NOTICE 'created_by column exists: %', col_exists;
END $$;

-- Add missing columns for content library functionality
DO $$
BEGIN
  RAISE NOTICE 'Starting ALTER TABLE content_library...';
  
  -- Check if table exists first
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') THEN
    RAISE NOTICE 'ERROR: content_library table does not exist';
    RETURN;
  END IF;
  
  ALTER TABLE content_library 
  ADD COLUMN IF NOT EXISTS thumbnail_url varchar,
  ADD COLUMN IF NOT EXISTS video_url varchar,
  ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  
  RAISE NOTICE 'ALTER TABLE content_library completed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR in ALTER TABLE content_library: %', SQLERRM;
END $$;

-- Verify the column was added
DO $$
DECLARE
    col_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='created_by'
    ) INTO col_exists;
    
    RAISE NOTICE 'After ALTER: created_by column exists: %', col_exists;
END $$;

-- Add indexes for better performance (only if columns exist)
DO $$
BEGIN
  -- Only create indexes if the columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='created_by') THEN
    CREATE INDEX IF NOT EXISTS idx_content_library_created_by ON content_library(created_by);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='is_global') THEN
    CREATE INDEX IF NOT EXISTS idx_content_library_is_global ON content_library(is_global);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='org_id') THEN
    CREATE INDEX IF NOT EXISTS idx_content_library_org_id ON content_library(org_id);
  END IF;
  
  -- Create muscle_groups index if column exists (regular index, not GIN)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='muscle_groups') THEN
    CREATE INDEX IF NOT EXISTS idx_content_library_muscle_groups ON content_library(muscle_groups);
  END IF;
END $$;

-- =====================================================
-- 2. CREATE PROGRAMS TABLE (if not exists)
-- =====================================================
DO $$
BEGIN
  -- Only create if organizations table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    CREATE TABLE IF NOT EXISTS programs (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      title varchar NOT NULL,
      description text,
      created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
      is_template boolean DEFAULT false,
      duration_weeks integer DEFAULT 4,
      difficulty varchar CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
      goals text[],
      total_exercises integer DEFAULT 0,
      estimated_duration integer, -- in minutes
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    RAISE NOTICE 'Created programs table';
  ELSE
    RAISE NOTICE 'Skipping programs table creation - organizations table does not exist';
  END IF;
END $$;

-- Add indexes (only if table and columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    -- Only create index if the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
      CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'org_id') THEN
      CREATE INDEX IF NOT EXISTS idx_programs_org_id ON programs(org_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'difficulty') THEN
      CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON programs(difficulty);
    END IF;
    
    RAISE NOTICE 'Created indexes for programs table';
  ELSE
    RAISE NOTICE 'Skipped programs indexes - table does not exist';
  END IF;
END $$;

-- =====================================================
-- 3. CREATE PROGRAM_DAYS TABLE (if not exists)
-- =====================================================
DO $$
BEGIN
  -- Only create if programs table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    CREATE TABLE IF NOT EXISTS program_days (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
      day_number integer NOT NULL,
      title varchar NOT NULL,
      description text,
      is_rest_day boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      UNIQUE(program_id, day_number)
    );
    RAISE NOTICE 'Created program_days table';
  ELSE
    RAISE NOTICE 'Skipping program_days table creation - programs table does not exist';
  END IF;
END $$;

-- Add indexes (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') THEN
    CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON program_days(program_id);
    CREATE INDEX IF NOT EXISTS idx_program_days_day_number ON program_days(program_id, day_number);
    RAISE NOTICE 'Created indexes for program_days table';
  ELSE
    RAISE NOTICE 'Skipped program_days indexes - table does not exist';
  END IF;
END $$;

-- =====================================================
-- 4. CREATE PROGRAM_EXERCISES TABLE (if not exists)
-- =====================================================
-- Only create if both content_library and program_days tables exist
DO $$
DECLARE
  content_library_id_type text;
  program_days_id_type text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') THEN
    
    -- Get the data types of the referenced tables' ID columns
    SELECT data_type INTO content_library_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'content_library' AND column_name = 'id';
    
    SELECT data_type INTO program_days_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'program_days' AND column_name = 'id';
    
    RAISE NOTICE 'content_library.id type: %, program_days.id type: %', content_library_id_type, program_days_id_type;
    
    -- Create program_exercises table with matching ID types
    IF content_library_id_type = 'uuid' AND program_days_id_type = 'uuid' THEN
      CREATE TABLE IF NOT EXISTS program_exercises (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        program_day_id uuid REFERENCES program_days(id) ON DELETE CASCADE NOT NULL,
        exercise_id uuid REFERENCES content_library(id) ON DELETE CASCADE NOT NULL,
        exercise_order integer NOT NULL,
        sets integer DEFAULT 1,
        reps varchar, -- Can be "12" or "8-12" or "AMRAP"
        weight varchar, -- Can be "bodyweight" or "15kg" or "RPE 7"
        rest_seconds integer DEFAULT 60,
        rpe integer CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
        notes text,
        created_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created program_exercises table with UUID foreign keys';
    ELSIF content_library_id_type = 'integer' AND program_days_id_type = 'integer' THEN
      CREATE TABLE IF NOT EXISTS program_exercises (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        program_day_id integer REFERENCES program_days(id) ON DELETE CASCADE NOT NULL,
        exercise_id integer REFERENCES content_library(id) ON DELETE CASCADE NOT NULL,
        exercise_order integer NOT NULL,
        sets integer DEFAULT 1,
        reps varchar, -- Can be "12" or "8-12" or "AMRAP"
        weight varchar, -- Can be "bodyweight" or "15kg" or "RPE 7"
        rest_seconds integer DEFAULT 60,
        rpe integer CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
        notes text,
        created_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created program_exercises table with INTEGER foreign keys';
    ELSE
      RAISE NOTICE 'Skipping program_exercises table creation - incompatible ID types: content_library.id=%, program_days.id=%', content_library_id_type, program_days_id_type;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping program_exercises table creation - required tables do not exist (content_library and program_days needed)';
  END IF;
END $$;

-- Add indexes (only if table and columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') THEN
    -- Only create indexes if the columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'program_day_id') THEN
      CREATE INDEX IF NOT EXISTS idx_program_exercises_program_day_id ON program_exercises(program_day_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'exercise_id') THEN
      CREATE INDEX IF NOT EXISTS idx_program_exercises_exercise_id ON program_exercises(exercise_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_exercises' AND column_name = 'exercise_order') THEN
      CREATE INDEX IF NOT EXISTS idx_program_exercises_order ON program_exercises(program_day_id, exercise_order);
    END IF;
    
    RAISE NOTICE 'Created indexes for program_exercises table';
  ELSE
    RAISE NOTICE 'Skipped program_exercises indexes - table does not exist';
  END IF;
END $$;

-- =====================================================
-- 5. CREATE CLIENT_PROGRAMS TABLE (for assignments)
-- =====================================================
DO $$
DECLARE
  programs_id_type text;
BEGIN
  -- Only create if programs table exists and check its ID type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    -- Get the data type of programs.id column
    SELECT data_type INTO programs_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'id';
    
    RAISE NOTICE 'programs.id data type: %', programs_id_type;
    
    -- Create client_programs table with matching ID type
    IF programs_id_type = 'uuid' THEN
      CREATE TABLE IF NOT EXISTS client_programs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
        assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        assigned_at timestamptz DEFAULT now(),
        start_date timestamptz DEFAULT now(),
        end_date timestamptz,
        is_active boolean DEFAULT true,
        completion_percentage numeric(5,2) DEFAULT 0,
        current_day integer DEFAULT 1,
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created client_programs table with UUID program_id';
    ELSIF programs_id_type = 'integer' THEN
      CREATE TABLE IF NOT EXISTS client_programs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        program_id integer REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
        assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        assigned_at timestamptz DEFAULT now(),
        start_date timestamptz DEFAULT now(),
        end_date timestamptz,
        is_active boolean DEFAULT true,
        completion_percentage numeric(5,2) DEFAULT 0,
        current_day integer DEFAULT 1,
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created client_programs table with INTEGER program_id';
    ELSE
      RAISE NOTICE 'Skipping client_programs table creation - programs.id has unsupported type: %', programs_id_type;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping client_programs table creation - programs table does not exist';
  END IF;
END $$;

-- Add indexes (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') THEN
    CREATE INDEX IF NOT EXISTS idx_client_programs_client_id ON client_programs(client_id);
    CREATE INDEX IF NOT EXISTS idx_client_programs_program_id ON client_programs(program_id);
    CREATE INDEX IF NOT EXISTS idx_client_programs_assigned_by ON client_programs(assigned_by);
    CREATE INDEX IF NOT EXISTS idx_client_programs_active ON client_programs(client_id, is_active);
    RAISE NOTICE 'Created indexes for client_programs table';
  ELSE
    RAISE NOTICE 'Skipped client_programs indexes - table does not exist';
  END IF;
END $$;

-- =====================================================
-- 6. CREATE EXERCISE_LOGS TABLE (for completion tracking)
-- =====================================================
DO $$
DECLARE
  client_programs_id_type text;
  program_exercises_id_type text;
BEGIN
  -- Only create if both client_programs and program_exercises tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') THEN
    
    -- Get the data types of the referenced tables' ID columns
    SELECT data_type INTO client_programs_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'client_programs' AND column_name = 'id';
    
    SELECT data_type INTO program_exercises_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'program_exercises' AND column_name = 'id';
    
    RAISE NOTICE 'client_programs.id type: %, program_exercises.id type: %', client_programs_id_type, program_exercises_id_type;
    
    -- Create exercise_logs table with matching ID types
    IF client_programs_id_type = 'uuid' AND program_exercises_id_type = 'uuid' THEN
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        client_program_id uuid REFERENCES client_programs(id) ON DELETE CASCADE NOT NULL,
        program_exercise_id uuid REFERENCES program_exercises(id) ON DELETE CASCADE NOT NULL,
        completed_at timestamptz DEFAULT now(),
        actual_sets integer,
        actual_reps varchar,
        actual_weight varchar,
        actual_rpe integer CHECK (actual_rpe >= 1 AND actual_rpe <= 10),
        duration_seconds integer,
        notes text,
        created_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created exercise_logs table with UUID foreign keys';
    ELSIF client_programs_id_type = 'integer' AND program_exercises_id_type = 'integer' THEN
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        client_program_id integer REFERENCES client_programs(id) ON DELETE CASCADE NOT NULL,
        program_exercise_id integer REFERENCES program_exercises(id) ON DELETE CASCADE NOT NULL,
        completed_at timestamptz DEFAULT now(),
        actual_sets integer,
        actual_reps varchar,
        actual_weight varchar,
        actual_rpe integer CHECK (actual_rpe >= 1 AND actual_rpe <= 10),
        duration_seconds integer,
        notes text,
        created_at timestamptz DEFAULT now()
      );
      RAISE NOTICE 'Created exercise_logs table with INTEGER foreign keys';
    ELSE
      RAISE NOTICE 'Skipping exercise_logs table creation - incompatible ID types: client_programs.id=%, program_exercises.id=%', client_programs_id_type, program_exercises_id_type;
    END IF;
  ELSE
    RAISE NOTICE 'Skipping exercise_logs table creation - dependent tables do not exist (client_programs and program_exercises needed)';
  END IF;
END $$;

-- Add indexes (only if table and columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') THEN
    -- Only create indexes if the columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'client_program_id') THEN
      CREATE INDEX IF NOT EXISTS idx_exercise_logs_client_program_id ON exercise_logs(client_program_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'program_exercise_id') THEN
      CREATE INDEX IF NOT EXISTS idx_exercise_logs_program_exercise_id ON exercise_logs(program_exercise_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'completed_at') THEN
      CREATE INDEX IF NOT EXISTS idx_exercise_logs_completed_at ON exercise_logs(completed_at);
    END IF;
    
    RAISE NOTICE 'Created indexes for exercise_logs table';
  ELSE
    RAISE NOTICE 'Skipped exercise_logs indexes - table does not exist';
  END IF;
END $$;

-- =====================================================
-- 7. HELPER FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (only if tables exist)
DO $$
BEGIN
  -- Only create trigger if programs table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
    CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created update trigger for programs';
  END IF;
  
  -- Only create trigger if client_programs table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') THEN
    DROP TRIGGER IF EXISTS update_client_programs_updated_at ON client_programs;
    CREATE TRIGGER update_client_programs_updated_at BEFORE UPDATE ON client_programs 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created update trigger for client_programs';
  END IF;
END $$;

-- Function to update program stats
CREATE OR REPLACE FUNCTION update_program_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_exercises count
    UPDATE programs 
    SET total_exercises = (
      SELECT COUNT(pe.id)
      FROM program_days pd
      JOIN program_exercises pe ON pe.program_day_id = pd.id
      WHERE pd.program_id = COALESCE(NEW.program_id, OLD.program_id)
    )
    WHERE id = COALESCE(NEW.program_id, OLD.program_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add triggers to update program stats when exercises change (only if tables exist)
DO $$
BEGIN
  -- Only create trigger if both tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') THEN
    
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_program_stats_on_exercise_change ON program_exercises;
    
    -- Create the trigger
    CREATE TRIGGER update_program_stats_on_exercise_change 
      AFTER INSERT OR UPDATE OR DELETE ON program_exercises
      FOR EACH ROW EXECUTE FUNCTION update_program_stats();
  END IF;
END $$;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Final debug check - verify all columns exist before creating policies
DO $$
BEGIN
  RAISE NOTICE 'Final verification - Tables and columns that exist:';
  RAISE NOTICE '- content_library table exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_library'));
  RAISE NOTICE '- content_library.created_by exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_library' AND column_name='created_by'));
  RAISE NOTICE '- content_library.is_global exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_library' AND column_name='is_global'));
  RAISE NOTICE '- content_library.org_id exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_library' AND column_name='org_id'));
  RAISE NOTICE '- programs table exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs'));
  RAISE NOTICE '- programs.created_by exists: %', (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='created_by'));
END $$;

-- Enable RLS on all tables (only if they exist)
DO $$
BEGIN
  -- Only enable RLS on content_library if created_by column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='created_by') THEN
    ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on content_library';
  ELSE
    RAISE NOTICE 'Skipped RLS on content_library - created_by column missing';
  END IF;
  
  -- Enable RLS on other tables if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on programs';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') THEN
    ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on program_days';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') THEN
    ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on program_exercises';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') THEN
    ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on client_programs';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') THEN
    ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on exercise_logs';
  END IF;
END $$;

-- Content Library Policies (only if created_by column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='created_by') AND
     EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='is_global') AND
     EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='content_library' AND column_name='org_id') THEN
    
    RAISE NOTICE 'Creating content_library policies...';
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own exercises and global exercises" ON content_library;
    DROP POLICY IF EXISTS "Users can create exercises" ON content_library;
    DROP POLICY IF EXISTS "Users can update their own exercises" ON content_library;
    DROP POLICY IF EXISTS "Users can delete their own exercises" ON content_library;
    
    -- Create new policies
    CREATE POLICY "Users can view their own exercises and global exercises" ON content_library
      FOR SELECT USING (
        created_by = auth.uid() OR 
        is_global = true OR
        (org_id IS NOT NULL AND org_id IN (
          SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
        ))
      );
      
    CREATE POLICY "Users can create exercises" ON content_library
      FOR INSERT WITH CHECK (created_by = auth.uid());

    CREATE POLICY "Users can update their own exercises" ON content_library
      FOR UPDATE USING (created_by = auth.uid());

    CREATE POLICY "Users can delete their own exercises" ON content_library
      FOR DELETE USING (created_by = auth.uid());
      
    RAISE NOTICE 'Content library policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped content_library policies - required columns missing';
  END IF;
END $$;

-- Programs Policies (only if tables and required columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    
    RAISE NOTICE 'Creating programs policies...';
    
    DROP POLICY IF EXISTS "Users can view their own programs and assigned programs" ON programs;
    DROP POLICY IF EXISTS "Users can create programs" ON programs;
    DROP POLICY IF EXISTS "Users can update their own programs" ON programs;
    DROP POLICY IF EXISTS "Users can delete their own programs" ON programs;
    
    CREATE POLICY "Users can view their own programs and assigned programs" ON programs
      FOR SELECT USING (
        created_by = auth.uid() OR
        id IN (SELECT program_id FROM client_programs WHERE client_id = auth.uid())
      );

    CREATE POLICY "Users can create programs" ON programs
      FOR INSERT WITH CHECK (created_by = auth.uid());

    CREATE POLICY "Users can update their own programs" ON programs
      FOR UPDATE USING (created_by = auth.uid());

    CREATE POLICY "Users can delete their own programs" ON programs
      FOR DELETE USING (created_by = auth.uid());
      
    RAISE NOTICE 'Programs policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped programs policies - required tables or columns missing (programs.created_by needed)';
  END IF;
END $$;

-- Program Days Policies (only if required columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    
    RAISE NOTICE 'Creating program_days policies...';
    
    DROP POLICY IF EXISTS "Users can view program days for accessible programs" ON program_days;
    DROP POLICY IF EXISTS "Users can manage program days for their own programs" ON program_days;
    
    CREATE POLICY "Users can view program days for accessible programs" ON program_days
      FOR SELECT USING (
        program_id IN (
          SELECT id FROM programs WHERE 
          created_by = auth.uid() OR
          id IN (SELECT program_id FROM client_programs WHERE client_id = auth.uid())
        )
      );

    CREATE POLICY "Users can manage program days for their own programs" ON program_days
      FOR ALL USING (
        program_id IN (SELECT id FROM programs WHERE created_by = auth.uid())
      );
      
    RAISE NOTICE 'Program days policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped program_days policies - required tables or columns missing (programs.created_by needed)';
  END IF;
END $$;

-- Program Exercises Policies (only if required columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_exercises') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_days') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    
    RAISE NOTICE 'Creating program_exercises policies...';
    
    DROP POLICY IF EXISTS "Users can view program exercises for accessible programs" ON program_exercises;
    DROP POLICY IF EXISTS "Users can manage program exercises for their own programs" ON program_exercises;
    
    CREATE POLICY "Users can view program exercises for accessible programs" ON program_exercises
      FOR SELECT USING (
        program_day_id IN (
          SELECT pd.id FROM program_days pd
          JOIN programs p ON p.id = pd.program_id
          WHERE p.created_by = auth.uid() OR
          p.id IN (SELECT program_id FROM client_programs WHERE client_id = auth.uid())
        )
      );

    CREATE POLICY "Users can manage program exercises for their own programs" ON program_exercises
      FOR ALL USING (
        program_day_id IN (
          SELECT pd.id FROM program_days pd
          JOIN programs p ON p.id = pd.program_id
          WHERE p.created_by = auth.uid()
        )
      );
      
    RAISE NOTICE 'Program exercises policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped program_exercises policies - required tables or columns missing (programs.created_by needed)';
  END IF;
END $$;

-- Client Programs Policies (only if required columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_by') THEN
    
    RAISE NOTICE 'Creating client_programs policies...';
    
    DROP POLICY IF EXISTS "Users can view their assignments and programs they created" ON client_programs;
    DROP POLICY IF EXISTS "Trainers can assign programs to clients" ON client_programs;
    DROP POLICY IF EXISTS "Trainers can update assignments for their programs" ON client_programs;
    
    CREATE POLICY "Users can view their assignments and programs they created" ON client_programs
      FOR SELECT USING (
        client_id = auth.uid() OR 
        assigned_by = auth.uid() OR
        program_id IN (SELECT id FROM programs WHERE created_by = auth.uid())
      );

    CREATE POLICY "Trainers can assign programs to clients" ON client_programs
      FOR INSERT WITH CHECK (assigned_by = auth.uid());

    CREATE POLICY "Trainers can update assignments for their programs" ON client_programs
      FOR UPDATE USING (
        assigned_by = auth.uid() OR
        program_id IN (SELECT id FROM programs WHERE created_by = auth.uid())
      );
      
    RAISE NOTICE 'Client programs policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped client_programs policies - required tables or columns missing (programs.created_by needed)';
  END IF;
END $$;

-- Exercise Logs Policies (only if required columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_programs') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_logs' AND column_name = 'client_program_id') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_programs' AND column_name = 'client_id') THEN
    
    RAISE NOTICE 'Creating exercise_logs policies...';
    
    DROP POLICY IF EXISTS "Users can view their own exercise logs" ON exercise_logs;
    DROP POLICY IF EXISTS "Users can create their own exercise logs" ON exercise_logs;
    
    CREATE POLICY "Users can view their own exercise logs" ON exercise_logs
      FOR SELECT USING (
        client_program_id IN (SELECT id FROM client_programs WHERE client_id = auth.uid())
      );

    CREATE POLICY "Users can create their own exercise logs" ON exercise_logs
      FOR INSERT WITH CHECK (
        client_program_id IN (SELECT id FROM client_programs WHERE client_id = auth.uid())
      );
      
    RAISE NOTICE 'Exercise logs policies created successfully';
  ELSE
    RAISE NOTICE 'Skipped exercise_logs policies - required tables or columns missing (exercise_logs.client_program_id and client_programs.client_id needed)';
  END IF;
END $$;

-- =====================================================
-- DONE! 
-- =====================================================
-- After running this script, your database will be ready 
-- for the content library and program builder features.
-- =====================================================