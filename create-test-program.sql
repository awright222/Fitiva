-- Create test program for trainer to test the interface
-- Run this in Supabase SQL Editor

-- 1. Create a test program for the trainer
INSERT INTO programs (trainer_id, title, description, created_at, updated_at) 
VALUES (
  '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid,
  'Beginner Fitness Program',
  'A simple fitness program for testing the trainer interface',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 2. Create a program day
WITH new_program AS (
  SELECT id FROM programs 
  WHERE trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid 
  AND title = 'Beginner Fitness Program'
  LIMIT 1
)
INSERT INTO program_days (program_id, day_number, notes)
SELECT id, 1, 'Day 1 - Full Body Workout'
FROM new_program
ON CONFLICT DO NOTHING;

-- 3. Verify program creation
SELECT 
  p.id,
  p.title,
  p.description,
  p.trainer_id,
  pd.day_number,
  pd.notes
FROM programs p
LEFT JOIN program_days pd ON pd.program_id = p.id
WHERE p.trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid
ORDER BY p.created_at DESC;