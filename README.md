# Fitiva - Mobile-First Fitness App for Seniors

A React Native + Expo + Supabase application designed to help seniors stay fit with trainer guidance and organizational support.

## 🏗️ Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (Database, Auth, Storage)
- **Language**: TypeScript
- **Authentication**: Supabase Auth with Row Level Security
- **Database**: PostgreSQL (via Supabase)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd Fitiva
   npm install
   ```

2. **Set up Supabase Database:**
   - Go to your Supabase project: https://kqnbottvwcnfwdjyyawr.supabase.co
   - Navigate to the SQL Editor
   - Copy and paste the entire contents of `supabase-schema.sql` into the SQL Editor
   - Click "Run" to execute the migration (this creates all tables, policies, and triggers)

3. **Environment is already configured:**
   - The `.env` file is already set up with your Supabase credentials
   - Project URL: https://kqnbottvwcnfwdjyyawr.supabase.co
   - The Supabase client is configured and ready to use

4. **Start the development server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/           # App constants and configuration
├── context/             # React context providers (auth, etc.)
├── hooks/               # Custom React hooks
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   ├── client/         # Client-specific screens
│   ├── trainer/        # Trainer-specific screens
│   └── org/            # Organization manager screens
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🗄️ Database Schema

The app uses a comprehensive database schema designed for:

- **User Management**: Multi-role system (client, trainer, org_manager, admin)
- **Organizations**: White-label support for fitness organizations
- **Programs & Sessions**: Workout programs and training sessions
- **Content Library**: Exercise videos, articles, and resources
- **Analytics**: Engagement tracking and reporting
- **Payments**: Subscription and payment processing
- **Compliance**: Audit logs and user consents

### Key Tables

- `users` - User profiles and authentication
- `organizations` - Organization management
- `sessions` - Training sessions between trainers and clients
- `programs` - Workout programs and exercises
- `content_library` - Exercise database and educational content
- `messages` - In-app messaging system
- `payments` - Payment and subscription tracking

## 🔐 Authentication

The app uses Supabase Authentication with:

- Email/password sign-up and sign-in
- Automatic user profile creation
- Role-based access control
- Row Level Security (RLS) for data protection
- Password reset functionality

### User Roles

- **Client**: End users who receive training
- **Trainer**: Fitness professionals who create programs and conduct sessions
- **Organization Manager**: Manages trainers and clients within an organization
- **Admin**: System administrators with full access

## 🔧 Configuration

### Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server operations (optional)

### App Configuration

Key settings can be found in `src/constants/index.ts`:

- Colors and theming
- Font sizes and spacing
- Validation rules
- API endpoints

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Code Organization

- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Use Expo SDK features where appropriate
- Structure code for role-based functionality

## 📱 Features (Roadmap)

### Phase 1 (Current)
- [x] Project setup and database schema
- [x] Authentication system
- [ ] Basic user profiles
- [ ] Role-based navigation

### Phase 2 (Upcoming)
- [ ] Trainer-client matching
- [ ] Program creation and management
- [ ] Session scheduling
- [ ] In-app messaging

### Phase 3 (Future)
- [ ] Video content integration
- [ ] Progress tracking and analytics
- [ ] Payment processing
- [ ] Organization management
- [ ] White-label customization

## 🤝 Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new code
3. Test authentication flows thoroughly
4. Ensure proper error handling
5. Update documentation for new features

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For questions or issues, contact: support@fitiva.com