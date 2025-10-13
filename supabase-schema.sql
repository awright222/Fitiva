-- Fitiva Database Schema Migration
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('client', 'trainer', 'org_manager', 'admin');
CREATE TYPE user_org_role AS ENUM ('client', 'trainer', 'org_manager');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'canceled');
CREATE TYPE content_type AS ENUM ('video', 'pdf', 'exercise', 'article');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'paid');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'paused');
CREATE TYPE program_status AS ENUM ('completed', 'skipped', 'partial');
CREATE TYPE activity_type AS ENUM ('login', 'view_program', 'start_exercise', 'watch_video', 'send_message');
CREATE TYPE streak_type AS ENUM ('login', 'workout_completion');

-- =============== CORE (MVP) =======================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    date_of_birth DATE,
    gender VARCHAR,
    height_cm INTEGER,
    weight_kg DECIMAL,
    location VARCHAR,
    preferred_language VARCHAR DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    branding JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User organizations junction table
CREATE TABLE user_organizations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    role user_org_role NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status session_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session feedback table
CREATE TABLE session_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rpe_avg DECIMAL CHECK (rpe_avg >= 1 AND rpe_avg <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program days table
CREATE TABLE program_days (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    notes TEXT
);

-- Content library table (exercises, videos, etc.)
CREATE TABLE content_library (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    type content_type NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    url VARCHAR,
    category VARCHAR,
    muscle_groups VARCHAR,
    equipment VARCHAR,
    difficulty difficulty_level,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program exercises table
CREATE TABLE program_exercises (
    id SERIAL PRIMARY KEY,
    program_day_id INTEGER REFERENCES program_days(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES content_library(id) ON DELETE CASCADE,
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL,
    percentage DECIMAL,
    rpe DECIMAL CHECK (rpe >= 1 AND rpe <= 10),
    notes TEXT
);

-- Exercise logs table
CREATE TABLE exercise_logs (
    id SERIAL PRIMARY KEY,
    program_exercise_id INTEGER REFERENCES program_exercises(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sets_completed INTEGER,
    reps_completed INTEGER,
    weight_used DECIMAL,
    rpe_logged DECIMAL CHECK (rpe_logged >= 1 AND rpe_logged <= 10),
    notes TEXT
);

-- Program progress table
CREATE TABLE program_progress (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    status program_status DEFAULT 'completed',
    adherence_percentage DECIMAL CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ TRAINER PROFILES ====================

-- Trainer skills table
CREATE TABLE trainer_skills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainer specialties table
CREATE TABLE trainer_specialties (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR NOT NULL,
    highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========== PAYMENTS & SUBSCRIPTIONS =============

-- Plans table
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    amount DECIMAL NOT NULL,
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainer payouts table
CREATE TABLE trainer_payouts (
    id SERIAL PRIMARY KEY,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    payout_status payout_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions table
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR UNIQUE NOT NULL,
    description TEXT,
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    status subscription_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ ANALYTICS & REPORTING ===============

-- Session stats table
CREATE TABLE session_stats (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    canceled_sessions INTEGER DEFAULT 0,
    time_period VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue reports table
CREATE TABLE revenue_reports (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
    total_revenue DECIMAL NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    time_period VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement reports table
CREATE TABLE engagement_reports (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_logins INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    total_programs_completed INTEGER DEFAULT 0,
    avg_session_length INTEGER DEFAULT 0,
    time_period VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity table
CREATE TABLE user_activity (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks table
CREATE TABLE streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    streak_type streak_type NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop off points table
CREATE TABLE drop_off_points (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    last_completed_day INTEGER,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============== COMPLIANCE =======================

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    action VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consents table
CREATE TABLE consents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_version VARCHAR
);

-- Assessments table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============== NOTIFICATIONS =====================

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============== TRIGGERS & FUNCTIONS ==============

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== ROW LEVEL SECURITY ================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_off_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- User activity policies
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies (users can see messages they sent or received)
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Sessions policies (trainers and clients can see their sessions)
CREATE POLICY "Users can view their sessions" ON sessions FOR SELECT USING (
  auth.uid() = trainer_id OR auth.uid() = client_id
);

-- Programs policies (trainers and clients can see their programs)
CREATE POLICY "Users can view their programs" ON programs FOR SELECT USING (
  auth.uid() = trainer_id OR auth.uid() = client_id
);

-- Content library (allow read access to all authenticated users)
CREATE POLICY "Authenticated users can view content" ON content_library FOR SELECT TO authenticated USING (true);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_trainer_id ON sessions(trainer_id);
CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_programs_trainer_id ON programs(trainer_id);
CREATE INDEX idx_programs_client_id ON programs(client_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);