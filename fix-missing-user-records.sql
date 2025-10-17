-- Fix missing user records for client1@fitiva.com
-- This addresses the foreign key constraint error

-- First, let's see what tables we're dealing with
SELECT 'AUTH USERS:' as info, au.id, au.email, au.created_at
FROM auth.users au 
WHERE au.email = 'client1@fitiva.com';

-- Check if there's a separate 'users' table
SELECT 'USERS TABLE CHECK:' as info, u.id, u.email, u.created_at
FROM users u 
WHERE u.email = 'client1@fitiva.com';

-- Check profiles table
SELECT 'PROFILES CHECK:' as info, p.id, p.email, p.full_name
FROM profiles p 
WHERE p.email = 'client1@fitiva.com';

-- Check user_organizations table
SELECT 'USER_ORGANIZATIONS CHECK:' as info, uo.user_id, uo.role
FROM user_organizations uo 
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'client1@fitiva.com';

-- Create missing record in users table if it doesn't exist
INSERT INTO users (id, name, email, role, created_at, updated_at)
SELECT 
    au.id,
    'Client One',
    au.email,
    'client',
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'client1@fitiva.com'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Create missing profile if it doesn't exist
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'Client One', -- Default name
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'client1@fitiva.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Now create the user_organizations record
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

-- Final verification
SELECT 'FINAL VERIFICATION:' as info;

SELECT 'AUTH USER:' as table_name, au.email, au.id::text as value
FROM auth.users au 
WHERE au.email = 'client1@fitiva.com'

UNION ALL

SELECT 'USERS TABLE:' as table_name, u.email, u.id::text as value
FROM users u 
WHERE u.email = 'client1@fitiva.com'

UNION ALL

SELECT 'PROFILES:' as table_name, p.email, p.id::text as value
FROM profiles p 
WHERE p.email = 'client1@fitiva.com'

UNION ALL

SELECT 'USER_ORGANIZATIONS:' as table_name, au.email, uo.role::text as value
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'client1@fitiva.com';

SELECT 'SETUP COMPLETE' as result;