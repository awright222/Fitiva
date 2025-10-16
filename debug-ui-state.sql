-- Test program UI state management debug
-- This script helps debug the UI state management issue

-- 1. First, let's check the current programs in the database
SELECT 
    id,
    title,
    description,
    created_by,
    duration_weeks,
    difficulty,
    created_at,
    updated_at
FROM programs 
WHERE created_by = 'e7b3c4d5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
ORDER BY updated_at DESC;

-- 2. Check if there are any issues with the RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'programs'
ORDER BY policyname;

-- 3. Test a simple update to see if it works and gets reflected
-- Replace 'PROGRAM_ID_HERE' with an actual program ID from the first query
/*
UPDATE programs 
SET description = 'Updated description ' || NOW()::text
WHERE id = PROGRAM_ID_HERE 
AND created_by = 'e7b3c4d5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
*/