# Test Accounts for Development

This file contains test user accounts for development and testing purposes.

## Test User Credentials

### Client Account
- **Name**: Test Client
- **Email**: TestClient@test.com
- **Password**: TestClient123!
- **Role**: client
- **Created**: October 15, 2025
- **Notes**: Primary test account for client dashboard functionality

### Trainer Account
- **Name**: Test Trainer
- **Email**: TestTrainer@test.com
- **Password**: TestTrainer123!
- **Role**: trainer
- **Created**: October 15, 2025
- **Notes**: Primary test account for trainer dashboard functionality

### Organization Manager Account
- **Name**: Test Org
- **Email**: TestOrg@test.com
- **Password**: TestOrg123!
- **Role**: org_manager
- **Created**: October 15, 2025
- **Notes**: Primary test account for organization manager dashboard functionality

---

## Admin Account (From Seed Script)
- **Email**: admin@fitiva.com
- **Password**: AdminFitiva123!
- **Role**: admin
- **Notes**: Platform administrator account created via SQL seed script

---

## How to Add More Test Accounts

1. Use the signup flow in the app to create accounts with different roles
2. Document them here with the format above
3. Include role-specific test data if needed

## Test Data Notes

- All dashboards use mock data from `src/data/mockData.ts`
- Mock data includes realistic fitness industry content
- No real API calls are made - everything is simulated

## Development Tips

- Use different email addresses for each role to test role-based functionality
- Test the complete signup flow: Form → Role Selection → Account Creation
- Verify logout functionality works across all dashboards
- Test navigation between different role dashboards by switching accounts