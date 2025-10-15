# Supabase Email Configuration for Development

## Allow Test Domains (Optional)

If you want to use test emails like `test@example.com` during development:

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication → Settings → Email Auth
3. **Enable**: "Allow test email domains" 
4. **Or disable**: "Email verification" temporarily for development

## Recommended Development Emails

Instead of changing Supabase settings, use real domains for testing:

- `testuser@gmail.com`
- `john.doe@outlook.com` 
- `fitiva.test@yahoo.com`
- `developer@test.io`

## Production Note

Keep email verification enabled for production to prevent spam accounts.