-- Clean up duplicate user_organizations records for client1@fitiva.com
-- This will remove duplicates and keep only one record per user

-- First, let's see what duplicates exist
SELECT 
    'DUPLICATES CHECK:' as info,
    uo.user_id,
    uo.role,
    uo.org_id,
    COUNT(*) as count
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'client1@fitiva.com'
GROUP BY uo.user_id, uo.role, uo.org_id
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the first record for each user
DELETE FROM user_organizations 
WHERE id NOT IN (
    SELECT DISTINCT ON (uo.user_id) uo.id
    FROM user_organizations uo
    JOIN auth.users au ON au.id = uo.user_id
    WHERE au.email = 'client1@fitiva.com'
    ORDER BY uo.user_id, uo.id
);

-- Verify cleanup worked - should show only one record
SELECT 
    'FINAL CHECK:' as info,
    COUNT(*) as total_records,
    uo.role
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'client1@fitiva.com'
GROUP BY uo.role;

SELECT 'CLEANUP COMPLETE' as result;