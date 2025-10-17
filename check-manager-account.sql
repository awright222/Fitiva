-- Create manager@fitiva.com test account if it doesn't exist
-- Run this in Supabase SQL Editor

-- First check if the user exists in auth.users
SELECT 'AUTH USERS CHECK:' as info, au.id, au.email, au.created_at
FROM auth.users au 
WHERE au.email = 'manager@fitiva.com';

-- Check profiles table
SELECT 'PROFILES CHECK:' as info, p.id, p.email, p.full_name
FROM profiles p 
WHERE p.email = 'manager@fitiva.com';

-- Check users table  
SELECT 'USERS TABLE CHECK:' as info, u.id, u.email, u.name
FROM users u 
WHERE u.email = 'manager@fitiva.com';

-- Check user_organizations table
SELECT 'USER_ORGANIZATIONS CHECK:' as info, uo.user_id, uo.role, uo.org_id
FROM user_organizations uo 
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'manager@fitiva.com';

-- Get organization info
SELECT 'ORGANIZATION INFO:' as info, id, name
FROM organizations
WHERE name = 'Fitiva Fitness Center';

SELECT 'CHECK COMPLETE - If no results above, the manager account needs to be created' as result;