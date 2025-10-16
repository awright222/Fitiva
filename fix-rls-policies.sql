-- Fix RLS policies for programs table to allow updates
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'programs';

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their programs" ON programs;
DROP POLICY IF EXISTS "Trainers can create programs" ON programs;  
DROP POLICY IF EXISTS "Trainers can update their programs" ON programs;
DROP POLICY IF EXISTS "Trainers can delete their programs" ON programs;

-- Recreate policies with proper permissions
-- Allow trainers to view programs they created or are assigned to
CREATE POLICY "Users can view their programs" ON programs FOR SELECT USING (
  auth.uid() = trainer_id OR auth.uid() = client_id
);

-- Allow trainers to create programs
CREATE POLICY "Trainers can create programs" ON programs FOR INSERT WITH CHECK (
  auth.uid() = trainer_id
);

-- Allow trainers to update programs they created
CREATE POLICY "Trainers can update their programs" ON programs FOR UPDATE USING (
  auth.uid() = trainer_id
) WITH CHECK (
  auth.uid() = trainer_id
);

-- Allow trainers to delete programs they created
CREATE POLICY "Trainers can delete their programs" ON programs FOR DELETE USING (
  auth.uid() = trainer_id
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'programs';

-- =====================================================
-- RLS Policies for program_days table
-- =====================================================

-- Drop existing policies for program_days
DROP POLICY IF EXISTS "Users can view program days" ON program_days;
DROP POLICY IF EXISTS "Trainers can create program days" ON program_days;
DROP POLICY IF EXISTS "Trainers can update program days" ON program_days;
DROP POLICY IF EXISTS "Trainers can delete program days" ON program_days;

-- Allow users to view program days for programs they have access to
CREATE POLICY "Users can view program days" ON program_days FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM programs 
    WHERE programs.id = program_days.program_id 
    AND (auth.uid() = programs.trainer_id OR auth.uid() = programs.client_id)
  )
);

-- Allow trainers to create program days for their programs
CREATE POLICY "Trainers can create program days" ON program_days FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM programs 
    WHERE programs.id = program_days.program_id 
    AND auth.uid() = programs.trainer_id
  )
);

-- Allow trainers to update program days for their programs
CREATE POLICY "Trainers can update program days" ON program_days FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM programs 
    WHERE programs.id = program_days.program_id 
    AND auth.uid() = programs.trainer_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM programs 
    WHERE programs.id = program_days.program_id 
    AND auth.uid() = programs.trainer_id
  )
);

-- Allow trainers to delete program days for their programs
CREATE POLICY "Trainers can delete program days" ON program_days FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM programs 
    WHERE programs.id = program_days.program_id 
    AND auth.uid() = programs.trainer_id
  )
);

-- =====================================================
-- RLS Policies for program_exercises table
-- =====================================================

-- Drop existing policies for program_exercises
DROP POLICY IF EXISTS "Users can view program exercises" ON program_exercises;
DROP POLICY IF EXISTS "Trainers can create program exercises" ON program_exercises;
DROP POLICY IF EXISTS "Trainers can update program exercises" ON program_exercises;
DROP POLICY IF EXISTS "Trainers can delete program exercises" ON program_exercises;

-- Allow users to view program exercises for days they have access to
CREATE POLICY "Users can view program exercises" ON program_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_exercises.program_day_id 
    AND (auth.uid() = p.trainer_id OR auth.uid() = p.client_id)
  )
);

-- Allow trainers to create program exercises for their program days
CREATE POLICY "Trainers can create program exercises" ON program_exercises FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_exercises.program_day_id 
    AND auth.uid() = p.trainer_id
  )
);

-- Allow trainers to update program exercises for their program days
CREATE POLICY "Trainers can update program exercises" ON program_exercises FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_exercises.program_day_id 
    AND auth.uid() = p.trainer_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_exercises.program_day_id 
    AND auth.uid() = p.trainer_id
  )
);

-- Allow trainers to delete program exercises for their program days
CREATE POLICY "Trainers can delete program exercises" ON program_exercises FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM program_days pd
    JOIN programs p ON p.id = pd.program_id
    WHERE pd.id = program_exercises.program_day_id 
    AND auth.uid() = p.trainer_id
  )
);

-- =====================================================
-- Verify all policies were created
-- =====================================================

SELECT 'PROGRAMS TABLE POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'programs';

SELECT 'PROGRAM_DAYS TABLE POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'program_days';

SELECT 'PROGRAM_EXERCISES TABLE POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'program_exercises';