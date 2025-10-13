#!/bin/bash

# Fitiva Database Migration Script
# This script contains instructions for setting up the Supabase database

echo "🚀 Fitiva Database Migration"
echo "=============================="
echo
echo "To set up your Fitiva database schema:"
echo
echo "1. Go to your Supabase project dashboard:"
echo "   https://kqnbottvwcnfwdjyyawr.supabase.co"
echo
echo "2. Navigate to the SQL Editor"
echo
echo "3. Copy and paste the contents of 'supabase-schema.sql' into the SQL Editor"
echo
echo "4. Click 'Run' to execute the migration"
echo
echo "This will create:"
echo "  • All database tables (20+ tables)"
echo "  • User roles and permissions"
echo "  • Row Level Security policies"
echo "  • Indexes for performance"
echo "  • Triggers for automatic updates"
echo
echo "5. After migration, you can test authentication in the app!"
echo
echo "For manual migration, the SQL file is located at:"
echo "$(pwd)/supabase-schema.sql"
echo