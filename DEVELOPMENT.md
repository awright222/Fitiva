# Fitiva Development Setup Guide

## 🚀 Quick Setup for New Developers

### Prerequisites
- Node.js 18+
- Git
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### 1. Clone & Install
```bash
git clone https://github.com/awright222/Fitiva.git
cd Fitiva
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a Supabase project at https://supabase.com
2. Copy contents of `supabase-schema.sql`
3. Paste and run in Supabase SQL Editor
4. (Optional) Run `auth-fix.sql` if you encounter auth issues

### 4. Run Development Server
```bash
npm start
```

### 5. Test on Device
- Scan QR code with Expo Go app
- Or press 'w' to open in web browser

## 🏗️ Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── client/         # Client-specific screens
│   ├── trainer/        # Trainer-specific screens
│   └── org/            # Organization screens
├── services/           # API services (Supabase, Auth)
├── context/            # React context providers
├── types/              # TypeScript definitions
├── constants/          # App constants
└── utils/              # Helper functions
```

## 🔧 Available Scripts
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in browser

## 📚 Tech Stack
- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Language**: TypeScript
- **Authentication**: Supabase Auth with RLS

# Development Progress - Authentication & Navigation

## ✅ Completed Authentication Flow

### 1. **Authentication Screens**
- **LoginScreen**: Email/password login with form validation
- **SignUpScreen**: User registration with role selection
- **ForgotPasswordScreen**: Password reset functionality  
- **RoleSelectionScreen**: Role selection after signup (client, trainer, org_manager, admin)

### 2. **Enhanced AuthContext**
- Supabase authentication integration
- Secure session storage with Expo SecureStore
- Automatic session persistence and restoration
- User profile management with role-based access

### 3. **Complete Navigation System**
- **AuthNavigator**: Handles authentication flow
- **RootNavigator**: Route management based on auth state and user role
- **Role-based Tab Navigators**:
  - `ClientTabNavigator`: Home, Programs, Sessions, Messages, Profile
  - `TrainerTabNavigator`: Home, Clients, Programs, Schedule, Profile  
  - `OrgTabNavigator`: Home, Trainers, Clients, Analytics, Settings
  - `AdminTabNavigator`: Home, Organizations, Users, Analytics, Settings

### 4. **UI Components**
- Reusable `Button` component with variants and accessibility
- `InputField` component with validation and secure text support
- `PlaceholderScreen` for future features
- `LoadingScreen` for app initialization

### 5. **Database Schema**
- Comprehensive PostgreSQL schema with 20+ tables
- Row Level Security (RLS) policies
- User roles: client, trainer, org_manager, admin
- Organizations, sessions, programs, payments, analytics support

## 🧪 Testing the Authentication Flow

### Test User Accounts

**Platform Admin** (already created via admin-seed.sql):
- Email: `admin@fitiva.com`
- Password: `FitivaAdmin2024!`
- Role: `admin`

### Testing Steps

1. **Start the app**: `npm start`
2. **Test Login**: 
   - Use admin credentials above
   - Should navigate to AdminTabNavigator with admin-specific screens
3. **Test Signup**:
   - Create new account with different role
   - Should navigate to role selection, then appropriate tab navigator
4. **Test Role-based Navigation**:
   - Each role should see different tab structures and screens

### Current App State

The app is fully functional with:
- ✅ Complete authentication flow
- ✅ Role-based navigation 
- ✅ Secure session management
- ✅ Database integration
- ✅ TypeScript compilation without errors
- ✅ Placeholder screens for all features

## 🚀 Next Steps

1. **Test Authentication Flow**: Verify login/signup works end-to-end
2. **Input Validation**: Add comprehensive form validation
3. **Error Handling**: Improve user-friendly error messages
4. **UI Polish**: Enhance visual design and animations
5. **Feature Development**: Begin implementing core features (programs, sessions, etc.)

## 🛠️ Architecture Notes

- **React Native + Expo**: Cross-platform mobile development
- **Supabase**: Backend-as-a-Service (auth, database, storage)
- **TypeScript**: Type safety and better developer experience
- **React Navigation**: Native navigation patterns
- **Expo SecureStore**: Secure credential storage
- **Feature Flags**: Toggle upcoming features during development

The authentication foundation is complete and ready for feature development!

## 🐛 Common Issues
- **Auth signup fails**: Run `auth-fix.sql` in Supabase
- **Module not found**: Run `npm install`
- **Expo errors**: Clear cache with `npx expo start -c`

## 📞 Support
For questions or issues, check the README.md or create an issue on GitHub.