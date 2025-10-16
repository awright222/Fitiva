# Create Test Accounts for Fitiva

Since we can't directly insert into `auth.users` with working passwords, we need to create test accounts through the normal signup flow or via Supabase Auth Admin.

## Option 1: Manual Signup (Recommended)

Use the app's signup flow to create these test accounts:

### Trainer Account
- **Email**: `trainer@fitiva.com`
- **Password**: `FitivaTrainer2024!`
- **Name**: `Sarah Johnson`
- **Role**: `trainer`

### Client Accounts
- **Email**: `client1@fitiva.com`
- **Password**: `FitivaClient2024!` 
- **Name**: `Robert Smith`
- **Role**: `client`

- **Email**: `client2@fitiva.com`
- **Password**: `FitivaClient2024!`
- **Name**: `Mary Wilson`  
- **Role**: `client`

### Organization Manager
- **Email**: `manager@fitiva.com`
- **Password**: `FitivaManager2024!`
- **Name**: `David Brown`
- **Role**: `org_manager`

## Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Invite user" for each account
4. Use the emails and passwords above
5. Set the user metadata to include `name` and `role`

## Option 3: SQL Script for Existing Users

If you want to link existing authenticated users to our test data, run this after creating the accounts manually:

```sql
-- Link existing authenticated users to our test organization and data
-- (Run this AFTER creating the accounts through signup)

-- Update user metadata for existing users
UPDATE auth.users 
SET raw_user_meta_data = '{"name": "Sarah Johnson", "role": "trainer"}'::jsonb
WHERE email = 'trainer@fitiva.com';

UPDATE auth.users 
SET raw_user_meta_data = '{"name": "Robert Smith", "role": "client"}'::jsonb  
WHERE email = 'client1@fitiva.com';

UPDATE auth.users 
SET raw_user_meta_data = '{"name": "Mary Wilson", "role": "client"}'::jsonb
WHERE email = 'client2@fitiva.com';

UPDATE auth.users 
SET raw_user_meta_data = '{"name": "David Brown", "role": "org_manager"}'::jsonb
WHERE email = 'manager@fitiva.com';

-- Link users to organization (replace with actual user IDs)
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  au.id,
  o.id,
  CASE 
    WHEN au.email = 'trainer@fitiva.com' THEN 'trainer'
    WHEN au.email IN ('client1@fitiva.com', 'client2@fitiva.com') THEN 'client'  
    WHEN au.email = 'manager@fitiva.com' THEN 'org_manager'
  END
FROM auth.users au
CROSS JOIN organizations o
WHERE au.email IN ('trainer@fitiva.com', 'client1@fitiva.com', 'client2@fitiva.com', 'manager@fitiva.com')
  AND o.name = 'Fitiva Fitness Center'
ON CONFLICT DO NOTHING;

-- Assign programs to clients (replace with actual user IDs)  
INSERT INTO client_programs (
  client_id, program_id, assigned_by, assigned_at, start_date,
  is_active, completion_percentage, current_day, created_at, updated_at
)
SELECT 
  au.id,
  p.id,
  (SELECT id FROM auth.users WHERE email = 'trainer@fitiva.com'),
  NOW(),
  NOW(),
  true,
  CASE WHEN au.email = 'client1@fitiva.com' THEN 0.0 ELSE 15.0 END,
  1,
  NOW(),
  NOW()
FROM auth.users au
CROSS JOIN programs p  
WHERE au.email IN ('client1@fitiva.com', 'client2@fitiva.com')
  AND p.title = 'Senior Strength Foundations'
ON CONFLICT DO NOTHING;
```

## Quick Start

1. **Create the trainer account first** using the signup flow
2. **Login as trainer** to access content library and program builder
3. **Create client accounts** using signup flow  
4. **Run the SQL script above** to link everything together
5. **Login as client** to test the program experience

The sample exercises and program data from our seed script will be available once the accounts are properly linked!