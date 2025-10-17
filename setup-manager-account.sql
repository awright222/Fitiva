-- Complete setup for manager@fitiva.com account
-- Run this AFTER creating the account in Supabase Auth Dashboard
-- This assumes the auth user exists but needs profile/role setup

-- Get the auth user ID for manager@fitiva.com
DO $$
DECLARE
    manager_user_id UUID;
    target_org_id INTEGER;
BEGIN
    -- Get user ID from auth.users
    SELECT au.id INTO manager_user_id
    FROM auth.users au 
    WHERE au.email = 'manager@fitiva.com';
    
    -- Get organization ID
    SELECT o.id INTO target_org_id
    FROM organizations o
    WHERE o.name = 'Fitiva Fitness Center';
    
    IF manager_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found manager user ID: %', manager_user_id;
        
        -- Create/update users table record
        INSERT INTO users (id, name, email, role, created_at, updated_at)
        VALUES (
            manager_user_id,
            'David Brown',
            'manager@fitiva.com',
            'org_manager',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            updated_at = NOW();
        
        -- Create/update profiles table record
        INSERT INTO profiles (id, email, full_name, created_at, updated_at)
        VALUES (
            manager_user_id,
            'manager@fitiva.com',
            'David Brown',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
        
        -- Create user_organizations record
        IF target_org_id IS NOT NULL THEN
            INSERT INTO user_organizations (user_id, org_id, role)
            VALUES (manager_user_id, target_org_id, 'org_manager');
                
            RAISE NOTICE 'Manager account setup complete for organization: %', target_org_id;
        ELSE
            RAISE NOTICE 'Organization not found!';
        END IF;
        
    ELSE
        RAISE NOTICE 'Manager user not found in auth.users - create the account first!';
    END IF;
END $$;

-- Verify the setup
SELECT 'VERIFICATION:' as info;

SELECT 'AUTH USER:' as table_name, au.email, au.id::text as id
FROM auth.users au 
WHERE au.email = 'manager@fitiva.com'

UNION ALL

SELECT 'USERS TABLE:' as table_name, u.email, u.name as id
FROM users u 
WHERE u.email = 'manager@fitiva.com'

UNION ALL

SELECT 'PROFILES:' as table_name, p.email, p.full_name as id
FROM profiles p 
WHERE p.email = 'manager@fitiva.com'

UNION ALL

SELECT 'USER_ORGANIZATIONS:' as table_name, au.email, uo.role::text as id
FROM user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
WHERE au.email = 'manager@fitiva.com';

SELECT 'SETUP COMPLETE' as result;