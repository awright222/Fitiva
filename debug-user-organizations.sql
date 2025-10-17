-- Debug and fix user_organizations for client1@fitiva.com
-- Run this in Supabase SQL Editor

-- First, check if the user exists and what their ID is
SELECT 
    'USER CHECK:' as info,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
WHERE au.email = 'client1@fitiva.com';

-- Check if they have a record in user_organizations
SELECT 
    'USER_ORGANIZATIONS CHECK:' as info,
    uo.user_id,
    uo.role,
    uo.org_id
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'client1@fitiva.com';

-- Check if they have a profile
SELECT 
    'PROFILES CHECK:' as info,
    p.id,
    p.full_name,
    p.email
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email = 'client1@fitiva.com';

-- Get the organization ID (should be 1 for Fitiva Fitness Center)
SELECT 
    'ORGANIZATION CHECK:' as info,
    id,
    name
FROM organizations
WHERE name = 'Fitiva Fitness Center';

-- If user doesn't exist in user_organizations, create the record
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
    au.id,
    o.id,
    'client'
FROM auth.users au
CROSS JOIN organizations o
WHERE au.email = 'client1@fitiva.com'
  AND o.name = 'Fitiva Fitness Center'
  AND NOT EXISTS (
    SELECT 1 FROM user_organizations uo 
    WHERE uo.user_id = au.id
  );

-- Verify the insert worked
SELECT 
    'FINAL CHECK:' as info,
    au.email,
    uo.role,
    o.name
FROM auth.users au
JOIN user_organizations uo ON au.id = uo.user_id
JOIN organizations o ON o.id = uo.org_id
WHERE au.email = 'client1@fitiva.com';

SELECT 'DEBUG COMPLETE' as result;