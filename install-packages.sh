#!/bin/bash

# =====================================================
# Fitiva Package Installation Script
# =====================================================
# This script installs the required packages for the 
# enhanced Content Library and Program Builder features
# =====================================================

echo "🏋️  Installing Fitiva Enhanced Features Packages..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Expo CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing media handling packages..."
npx expo install expo-image-picker expo-av expo-video-thumbnails

echo ""
echo "📦 Installing additional UI and utility packages..."
npx expo install expo-linear-gradient react-native-gesture-handler

echo ""
echo "📦 Installing development and type packages..."
npm install --save-dev @types/react-native

echo ""
echo "✅ Package installation completed!"
echo ""
echo "🚀 Next Steps:"
echo "1. Run the database migration scripts:"
echo "   - Execute content-library-schema-complete.sql in your Supabase SQL Editor"
echo "   - Create storage buckets as described in supabase-storage-setup.sql"
echo ""
echo "2. Replace mock data services with real Supabase integration:"
echo "   - Update TrainerContentLibraryScreen to use src/services/content-library.ts"
echo "   - Update ProgramBuilderScreen to use real Supabase operations"
echo ""
echo "3. Enable file uploads:"
echo "   - Replace placeholder FileUpload component with full implementation"
echo "   - Configure Supabase storage buckets and policies"
echo ""
echo "4. Test the enhanced client experience:"
echo "   - Use ClientProgramViewScreenEnhanced.tsx for the complete client interface"
echo "   - Test exercise completion logging and progress tracking"
echo ""
echo "🎯 Your Fitiva app is now ready for enhanced content library features!"

# Optional: Show current package.json dependencies
echo ""
echo "📋 Current dependencies:"
node -e "
const pkg = require('./package.json');
console.log('Dependencies:', Object.keys(pkg.dependencies || {}).length);
console.log('DevDependencies:', Object.keys(pkg.devDependencies || {}).length);
"

echo ""
echo "Happy coding! 💪"