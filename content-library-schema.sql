-- Content Library and Program Builder Schema Updates
-- This file contains SQL migrations for the content library and program builder features

-- ===================================
-- Content Library Table Updates
-- ===================================

-- Add new columns to content_library table for enhanced functionality
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS muscle_groups TEXT[], -- Array of muscle groups
ADD COLUMN IF NOT EXISTS equipment VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER, -- Duration in minutes
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'strength', -- strength, cardio, flexibility, etc.
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS safety_notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_library_created_by ON content_library(created_by);
CREATE INDEX IF NOT EXISTS idx_content_library_org_id ON content_library(org_id);
CREATE INDEX IF NOT EXISTS idx_content_library_is_global ON content_library(is_global);
CREATE INDEX IF NOT EXISTS idx_content_library_difficulty ON content_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_library_category ON content_library(category);

-- ===================================
-- Programs Table Structure
-- ===================================

-- Main programs table
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) NOT NULL,
    org_id INTEGER REFERENCES organizations(id),
    is_template BOOLEAN DEFAULT false, -- Template programs vs assigned programs
    duration_weeks INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    goals TEXT[], -- Array of fitness goals
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program days (e.g., Day 1, Day 2, Rest Day)
CREATE TABLE IF NOT EXISTS program_days (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL, -- e.g., "Push Day", "Leg Day", "Rest"
    description TEXT,
    is_rest_day BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises within each program day
CREATE TABLE IF NOT EXISTS program_exercises (
    id SERIAL PRIMARY KEY,
    program_day_id INTEGER REFERENCES program_days(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES content_library(id),
    order_index INTEGER NOT NULL, -- Order within the day
    sets INTEGER,
    reps VARCHAR(20), -- e.g., "8-12", "AMRAP", "30 seconds"
    weight_kg DECIMAL(5,2),
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    rest_seconds INTEGER,
    notes TEXT,
    is_superset BOOLEAN DEFAULT false,
    superset_group INTEGER, -- Group superset exercises together
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- Client Program Assignments
-- ===================================

-- Assign programs to specific clients
CREATE TABLE IF NOT EXISTS client_programs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) NOT NULL,
    program_id INTEGER REFERENCES programs(id) NOT NULL,
    assigned_by INTEGER REFERENCES users(id) NOT NULL, -- Trainer who assigned
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(client_id, program_id, assigned_at) -- Prevent duplicate assignments
);

-- Track client progress on individual exercises
CREATE TABLE IF NOT EXISTS client_exercise_logs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) NOT NULL,
    program_exercise_id INTEGER REFERENCES program_exercises(id) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    actual_sets INTEGER,
    actual_reps VARCHAR(20),
    actual_weight_kg DECIMAL(5,2),
    actual_rpe INTEGER CHECK (actual_rpe >= 1 AND actual_rpe <= 10),
    notes TEXT,
    session_date DATE DEFAULT CURRENT_DATE
);

-- ===================================
-- Storage Buckets for File Uploads
-- ===================================

-- Create storage buckets for exercise media (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
-- ('exercise-thumbnails', 'exercise-thumbnails', true),
-- ('exercise-videos', 'exercise-videos', true);

-- ===================================
-- Row Level Security (RLS) Policies
-- ===================================

-- Enable RLS on all tables
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_exercise_logs ENABLE ROW LEVEL SECURITY;

-- Content Library Policies
-- Trainers can view all global exercises + their own
CREATE POLICY "content_library_trainer_view" ON content_library
    FOR SELECT USING (
        is_global = true OR 
        created_by = auth.uid() OR
        (org_id IS NOT NULL AND org_id IN (
            SELECT org_id FROM user_profiles WHERE user_id = auth.uid()
        ))
    );

-- Trainers can insert their own exercises
CREATE POLICY "content_library_trainer_insert" ON content_library
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Trainers can update/delete their own exercises
CREATE POLICY "content_library_trainer_update" ON content_library
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "content_library_trainer_delete" ON content_library
    FOR DELETE USING (created_by = auth.uid());

-- Clients can view exercises assigned to them
CREATE POLICY "content_library_client_view" ON content_library
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT pe.exercise_id 
            FROM program_exercises pe
            JOIN program_days pd ON pe.program_day_id = pd.id
            JOIN programs p ON pd.program_id = p.id
            JOIN client_programs cp ON p.id = cp.program_id
            WHERE cp.client_id = auth.uid() AND cp.is_active = true
        )
    );

-- Programs Policies
-- Trainers can view/modify their own programs
CREATE POLICY "programs_trainer_access" ON programs
    FOR ALL USING (created_by = auth.uid());

-- Clients can view programs assigned to them
CREATE POLICY "programs_client_view" ON programs
    FOR SELECT USING (
        id IN (
            SELECT program_id FROM client_programs 
            WHERE client_id = auth.uid() AND is_active = true
        )
    );

-- Similar policies for other tables...
-- (Abbreviated for brevity - full policies would be implemented)

-- ===================================
-- Indexes for Performance
-- ===================================

CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);
CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON program_days(program_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_program_day_id ON program_exercises(program_day_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_exercise_id ON program_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_client_id ON client_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_program_id ON client_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_client_exercise_logs_client_id ON client_exercise_logs(client_id);

-- ===================================
-- Trigger for Updated At Timestamps
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables with updated_at columns
CREATE TRIGGER update_content_library_updated_at 
    BEFORE UPDATE ON content_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at 
    BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Sample Data for Testing
-- ===================================

-- Insert some global exercises for testing
INSERT INTO content_library (
    title, description, difficulty, equipment, muscle_groups, 
    category, is_global, created_by, instructions
) VALUES 
('Push-ups', 'Classic bodyweight chest exercise', 'beginner', 'bodyweight', 
 ARRAY['chest', 'triceps', 'shoulders'], 'strength', true, 1,
 '1. Start in plank position\n2. Lower chest to floor\n3. Push back up'),
 
('Squats', 'Fundamental lower body movement', 'beginner', 'bodyweight',
 ARRAY['quadriceps', 'glutes', 'hamstrings'], 'strength', true, 1,
 '1. Stand with feet shoulder-width apart\n2. Lower by bending knees\n3. Return to standing'),
 
('Plank', 'Core stability exercise', 'beginner', 'bodyweight',
 ARRAY['core', 'shoulders'], 'strength', true, 1,
 '1. Hold plank position\n2. Keep body straight\n3. Breathe normally');

-- This file should be run in Supabase SQL editor or via migration tool