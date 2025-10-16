-- Add missing RLS policies for program_days and program_exercises tables
-- Run this in Supabase SQL Editor to fix the "row-level security policy" error

-- =====================================================
-- RLS Policies for program_days table
-- =====================================================

-- Drop existing policies for program_days (if any)
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

-- Drop existing policies for program_exercises (if any)
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
-- Verify all policies were created successfully
-- =====================================================

SELECT 'PROGRAM_DAYS TABLE POLICIES:' as info;
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'program_days'
ORDER BY policyname;

SELECT 'PROGRAM_EXERCISES TABLE POLICIES:' as info;
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'program_exercises'
ORDER BY policyname;

SELECT 'SUCCESS: RLS policies created for program structure tables!' as result;