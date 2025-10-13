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

## 🎯 Current Status
- ✅ Project setup complete
- ✅ Database schema implemented
- ✅ Authentication services ready
- 🚧 UI screens (in development)

## 🐛 Common Issues
- **Auth signup fails**: Run `auth-fix.sql` in Supabase
- **Module not found**: Run `npm install`
- **Expo errors**: Clear cache with `npx expo start -c`

## 📞 Support
For questions or issues, check the README.md or create an issue on GitHub.