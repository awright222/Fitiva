-- Create a test program for the logged-in trainer
INSERT INTO programs (
  trainer_id,
  title,
  description,
  created_at,
  updated_at
) VALUES (
  '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid,
  'Sample Strength Training Program',
  'A basic strength training program for testing the trainer interface',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Get the program ID and create a program day
WITH new_program AS (
  SELECT id FROM programs 
  WHERE trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid 
  AND title = 'Sample Strength Training Program'
  LIMIT 1
)
INSERT INTO program_days (
  program_id,
  day_number,
  notes
) 
SELECT id, 1, 'Day 1 - Upper Body'
FROM new_program
ON CONFLICT DO NOTHING;

-- Add a program exercise if we have exercises in content_library
WITH program_day AS (
  SELECT pd.id as program_day_id
  FROM program_days pd
  JOIN programs p ON p.id = pd.program_id
  WHERE p.trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid
  AND pd.day_number = 1
  LIMIT 1
),
exercise AS (
  SELECT id as exercise_id
  FROM content_library
  WHERE type = 'exercise'
  LIMIT 1
)
INSERT INTO program_exercises (
  program_day_id,
  exercise_id,
  sets,
  reps,
  notes
)
SELECT pd.program_day_id, e.exercise_id, 3, 10, 'Standard working sets'
FROM program_day pd, exercise e
ON CONFLICT DO NOTHING;

-- Verify what was created
SELECT 
  p.id as program_id,
  p.title,
  p.description,
  pd.id as program_day_id,
  pd.day_number,
  pe.id as program_exercise_id,
  pe.sets,
  pe.reps
FROM programs p
LEFT JOIN program_days pd ON pd.program_id = p.id
LEFT JOIN program_exercises pe ON pe.program_day_id = pd.id
WHERE p.trainer_id = '4505ca13-bda1-4d4f-9524-0bfea6d3516e'::uuid;
