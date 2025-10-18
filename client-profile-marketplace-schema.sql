-- =====================================================
-- Client Profile & Program Marketplace Schema Updates
-- =====================================================
-- This file extends the existing Fitiva database schema to support:
-- 1. Enhanced client profiles for personalization
-- 2. Public program marketplace functionality  
-- 3. Client-program relationship management
--
-- Prerequisites: Run supabase-schema.sql first
-- Run this in your Supabase SQL Editor or via migrations
-- =====================================================

-- Add marketplace-related enums
CREATE TYPE IF NOT EXISTS training_style AS ENUM ('in_person', 'virtual', 'self_guided', 'any');
CREATE TYPE IF NOT EXISTS activity_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE IF NOT EXISTS program_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE IF NOT EXISTS program_category AS ENUM ('strength', 'cardio', 'flexibility', 'balance', 'recovery', 'weight_loss', 'muscle_gain', 'general_fitness');
CREATE TYPE IF NOT EXISTS client_program_status AS ENUM ('active', 'completed', 'paused', 'archived');

-- =====================================================
-- 1. CLIENT PROFILES TABLE
-- =====================================================
-- Expanded client profile for detailed onboarding and personalization
CREATE TABLE IF NOT EXISTS client_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Personal Information
  age INTEGER,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  gender VARCHAR(20),
  location VARCHAR(100),
  
  -- Fitness Goals & Preferences
  goals TEXT[], -- e.g. ["mobility", "weight_loss", "strength"]
  preferred_training_style training_style DEFAULT 'any',
  frequency_per_week INTEGER CHECK (frequency_per_week >= 1 AND frequency_per_week <= 7),
  
  -- Health & Medical Information
  physical_limitations TEXT,
  medical_conditions TEXT[],
  medications TEXT,
  
  -- Equipment & Activity
  equipment_access TEXT[], -- e.g. ["dumbbells", "resistance_bands", "gym_access"]
  activity_level activity_level DEFAULT 'moderate',
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10) DEFAULT 5,
  
  -- Privacy & Discovery
  discoverable BOOLEAN DEFAULT true, -- Can trainers find this client for recommendations?
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. EXTEND PROGRAMS TABLE FOR MARKETPLACE
-- =====================================================
-- Add marketplace fields to existing programs table
DO $$ 
BEGIN
  -- Check if columns already exist before adding them
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'difficulty') THEN
    ALTER TABLE programs ADD COLUMN difficulty program_difficulty DEFAULT 'beginner';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'duration_weeks') THEN
    ALTER TABLE programs ADD COLUMN duration_weeks INTEGER CHECK (duration_weeks > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'category') THEN
    ALTER TABLE programs ADD COLUMN category program_category DEFAULT 'general_fitness';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'price') THEN
    ALTER TABLE programs ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'is_public') THEN
    ALTER TABLE programs ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'equipment_needed') THEN
    ALTER TABLE programs ADD COLUMN equipment_needed TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE programs ADD COLUMN thumbnail_url VARCHAR(500);
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN programs.difficulty IS 'Difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN programs.duration_weeks IS 'Expected duration of the program in weeks';
COMMENT ON COLUMN programs.category IS 'Program category for marketplace filtering';
COMMENT ON COLUMN programs.price IS 'Program price (for future paid programs feature)';
COMMENT ON COLUMN programs.is_public IS 'Whether program is visible in public marketplace';
COMMENT ON COLUMN programs.equipment_needed IS 'Array of equipment required for this program';
COMMENT ON COLUMN programs.thumbnail_url IS 'Program thumbnail image URL';

-- =====================================================
-- 3. CLIENT PROGRAMS RELATIONSHIP TABLE
-- =====================================================
-- Links clients to programs (both assigned and self-selected)
CREATE TABLE IF NOT EXISTS client_programs (
  id SERIAL PRIMARY KEY,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for self-selected
  
  -- Progress tracking
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status client_program_status DEFAULT 'active',
  
  -- Important dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate assignments
  UNIQUE(client_id, program_id)
);

-- Add comments
COMMENT ON TABLE client_programs IS 'Links clients to programs with progress tracking';
COMMENT ON COLUMN client_programs.assigned_by IS 'Trainer who assigned the program (NULL for self-selected)';

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
-- Client profiles indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_discoverable ON client_profiles(discoverable) WHERE discoverable = true;
CREATE INDEX IF NOT EXISTS idx_client_profiles_goals ON client_profiles USING GIN(goals);
CREATE INDEX IF NOT EXISTS idx_client_profiles_equipment ON client_profiles USING GIN(equipment_access);

-- Programs marketplace indexes
CREATE INDEX IF NOT EXISTS idx_programs_public ON programs(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON programs(difficulty);
CREATE INDEX IF NOT EXISTS idx_programs_trainer_public ON programs(trainer_id, is_public);
CREATE INDEX IF NOT EXISTS idx_programs_equipment ON programs USING GIN(equipment_needed);

-- Client programs indexes
CREATE INDEX IF NOT EXISTS idx_client_programs_client ON client_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_program ON client_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_trainer ON client_programs(assigned_by);
CREATE INDEX IF NOT EXISTS idx_client_programs_status ON client_programs(status);
CREATE INDEX IF NOT EXISTS idx_client_programs_client_status ON client_programs(client_id, status);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;

-- Client Profiles RLS Policies
-- Users can read/update their own profile
CREATE POLICY "Users can read their own profile" ON client_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON client_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON client_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trainers can read discoverable client profiles (for recommendations)
CREATE POLICY "Trainers can read discoverable profiles" ON client_profiles
    FOR SELECT USING (
        discoverable = true AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('trainer', 'org_manager', 'admin'))
    );

-- Admins and org managers can access all profiles in their org
CREATE POLICY "Org managers can read org client profiles" ON client_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_organizations uo ON u.id = uo.user_id
            WHERE u.id = auth.uid() 
            AND u.role IN ('org_manager', 'admin')
            AND uo.org_id IN (
                SELECT org_id FROM user_organizations WHERE user_id = client_profiles.user_id
            )
        )
    );

-- Programs RLS Updates (extend existing policies for marketplace)
-- Public programs are readable by anyone
CREATE POLICY "Anyone can read public programs" ON programs
    FOR SELECT USING (is_public = true);

-- Client Programs RLS Policies
-- Clients can read their own program assignments
CREATE POLICY "Clients can read their own programs" ON client_programs
    FOR SELECT USING (client_id = auth.uid());

-- Clients can insert programs for themselves (marketplace selections)
CREATE POLICY "Clients can add programs to themselves" ON client_programs
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Clients can update their own program progress
CREATE POLICY "Clients can update their own program progress" ON client_programs
    FOR UPDATE USING (client_id = auth.uid());

-- Trainers can read programs they've assigned
CREATE POLICY "Trainers can read programs they assigned" ON client_programs
    FOR SELECT USING (assigned_by = auth.uid());

-- Trainers can assign programs to their clients
CREATE POLICY "Trainers can assign programs to clients" ON client_programs
    FOR INSERT WITH CHECK (
        assigned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('trainer', 'org_manager', 'admin')
        )
    );

-- Trainers can update programs they've assigned
CREATE POLICY "Trainers can update assigned programs" ON client_programs
    FOR UPDATE USING (assigned_by = auth.uid());

-- Org managers and admins can access all client programs in their org
CREATE POLICY "Org managers can access org client programs" ON client_programs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_organizations uo ON u.id = uo.user_id
            WHERE u.id = auth.uid() 
            AND u.role IN ('org_manager', 'admin')
            AND uo.org_id IN (
                SELECT org_id FROM user_organizations WHERE user_id = client_programs.client_id
            )
        )
    );

-- =====================================================
-- 6. FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to automatically create trainer-client relationship when client selects trainer's program
CREATE OR REPLACE FUNCTION handle_client_program_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a self-selected program (assigned_by is the program's trainer_id but not explicitly assigned)
    -- and no trainer-client relationship exists, create one
    IF NEW.assigned_by IS NOT NULL AND NEW.assigned_by != NEW.client_id THEN
        -- Check if trainer-client relationship exists
        IF NOT EXISTS (
            SELECT 1 FROM trainer_clients 
            WHERE trainer_id = NEW.assigned_by AND client_id = NEW.client_id
        ) THEN
            -- Create trainer-client relationship
            INSERT INTO trainer_clients (trainer_id, client_id, status, connected_at)
            VALUES (NEW.assigned_by, NEW.client_id, 'active', NOW())
            ON CONFLICT (trainer_id, client_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle trainer-client relationships
DROP TRIGGER IF EXISTS trigger_client_program_assignment ON client_programs;
CREATE TRIGGER trigger_client_program_assignment
    AFTER INSERT ON client_programs
    FOR EACH ROW
    EXECUTE FUNCTION handle_client_program_assignment();

-- Function to update program progress
CREATE OR REPLACE FUNCTION update_program_progress(
    p_client_program_id INTEGER,
    p_progress_percent INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE client_programs 
    SET 
        progress_percent = p_progress_percent,
        updated_at = NOW(),
        completed_at = CASE 
            WHEN p_progress_percent >= 100 THEN NOW()
            ELSE completed_at
        END,
        status = CASE 
            WHEN p_progress_percent >= 100 THEN 'completed'::client_program_status
            WHEN p_progress_percent > 0 THEN 'active'::client_program_status
            ELSE status
        END
    WHERE id = p_client_program_id
    AND client_id = auth.uid(); -- Security: only update own programs
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VIEWS FOR CONVENIENCE
-- =====================================================

-- View for marketplace programs with trainer info
CREATE OR REPLACE VIEW marketplace_programs AS
SELECT 
    p.*,
    u.name as trainer_name,
    cp.id as client_program_id,
    cp.progress_percent,
    cp.status as client_status
FROM programs p
JOIN users u ON p.trainer_id = u.id
LEFT JOIN client_programs cp ON p.id = cp.program_id AND cp.client_id = auth.uid()
WHERE p.is_public = true
ORDER BY p.created_at DESC;

-- View for client's personal program library
CREATE OR REPLACE VIEW client_program_library AS
SELECT 
    cp.*,
    p.title as program_title,
    p.description as program_description,
    p.difficulty,
    p.duration_weeks,
    p.category,
    p.thumbnail_url,
    u.name as trainer_name
FROM client_programs cp
JOIN programs p ON cp.program_id = p.id
LEFT JOIN users u ON cp.assigned_by = u.id
WHERE cp.client_id = auth.uid()
ORDER BY cp.created_at DESC;

-- =====================================================
-- 8. SAMPLE DATA UPDATES (for testing)
-- =====================================================
-- Note: Sample data will be added via separate mock data files
-- This ensures proper separation of schema and test data

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- You can now use the new client profile and marketplace features!
-- 
-- Next steps:
-- 1. Add feature flags (PROGRAM_MARKETPLACE_ENABLED = true)
-- 2. Create UI screens for client profiles and marketplace
-- 3. Add mock data for testing
-- 4. Update navigation to include new screens