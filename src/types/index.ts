// User roles in the system
export type UserRole = 'client' | 'trainer' | 'org_manager' | 'admin';

// User organization roles
export type UserOrgRole = 'client' | 'trainer' | 'org_manager';

// User interface
export interface User {
  id: string;  // UUID from Supabase auth
  full_name: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  date_of_birth?: string;  // ISO date string
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  created_at: string;  // ISO date string
  updated_at: string;  // ISO date string
}

// Organization interface
export interface Organization {
  id: number;
  name: string;
  branding?: any;
  created_at: string;
  updated_at: string;
}

// Session statuses
export type SessionStatus = 'scheduled' | 'completed' | 'canceled' | 'pending';

// Session modes for hybrid scheduling
export type SessionMode = 'in_person' | 'virtual' | 'self_guided';

// Training style preferences
export type TrainingStyle = 'in_person' | 'virtual' | 'self_guided' | 'any';

// Activity levels
export type ActivityLevel = 'low' | 'moderate' | 'high';

// Program difficulty levels
export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Program categories
export type ProgramCategory = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'recovery' | 'weight_loss' | 'muscle_gain' | 'general_fitness';

// Client program status
export type ClientProgramStatus = 'active' | 'completed' | 'paused' | 'archived';

// Session interface
export interface Session {
  id: string | number; // Support both string (mock) and number (database) IDs
  trainer_id: string;  // UUID reference to users table
  client_id: string;   // UUID reference to users table
  org_id?: number;
  scheduled_at: string;  // ISO date string
  status: SessionStatus;
  session_mode: SessionMode;  // NEW: Type of session delivery
  video_link?: string;  // NEW: For virtual sessions (Zoom, Teams, etc.)
  program_id?: number;  // NEW: For self-guided sessions, link to assigned program
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Program interface
export interface Program {
  id: number; // Database uses SERIAL (integer), not UUID
  title: string;
  name?: string; // Alias for title for backwards compatibility
  description?: string;
  duration_weeks?: number;
  difficulty?: string;
  difficulty_level?: string; // Alias for difficulty for backwards compatibility
  category?: string;
  is_template?: boolean;
  is_active?: boolean;
  goals?: string[];
  trainer_id: string; // UUID reference to trainer (users table)
  client_id?: string; // UUID reference to client (users table) - nullable
  created_by?: string; // Legacy alias for trainer_id
  org_id?: number; // Should be number, not string
  created_at: string;
  updated_at: string;
  program_days?: ProgramDay[];
  days?: ProgramDay[]; // Alias for program_days for UI compatibility
  client_programs?: ClientProgramAssignment[];
}

// Authentication related types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: UserRole;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  date_of_birth?: string;  // ISO date string
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Content Library & Exercise Types
export interface Exercise {
  id: number;
  name: string;
  title: string; // Alias for name for UI compatibility
  description: string;
  instructions?: string;
  category: string;
  muscle_groups: string[];
  difficulty_level: string;
  difficulty: string; // Alias for difficulty_level for UI compatibility
  equipment_needed?: string[];
  equipment?: string; // Alias for equipment_needed for UI compatibility
  duration_minutes?: number;
  estimated_duration?: number; // Alias for duration_minutes for UI compatibility
  thumbnail_url?: string;
  video_url?: string;
  is_global?: boolean;
  org_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramDay {
  id: number;
  program_id: number;
  day_number: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  program_exercises?: ProgramExercise[];
}

export interface ProgramExercise {
  id: number;
  program_day_id: number;
  exercise_id: number;
  exercise?: Exercise;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProgramAssignment {
  id: string;
  program_id: number;
  client_id: string;
  assigned_date: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  client?: User;
}

// Client Program interface (for client_programs table)
export interface ClientProgram {
  id: string;
  client_id: string;
  program_id: number;
  assigned_by: string;
  assigned_at: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  completion_percentage: number;
  current_day: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLog {
  id: string;
  client_program_id: string;
  program_exercise_id: string;
  completed_at: string;
  actual_sets?: number;
  actual_reps?: string;
  actual_duration?: number;
  notes?: string;
  created_at: string;
  program_exercise?: ProgramExercise;
}

// Filter interfaces for content library
export interface ExerciseFilters {
  category?: string[];
  muscle_groups?: string[];
  difficulty?: string[];
  equipment?: string[];
  search?: string;
  created_by?: string;
  has_video?: boolean;
  has_thumbnail?: boolean;
}

// =====================================================
// CLIENT PROFILE & MARKETPLACE TYPES
// =====================================================

// Enhanced Client Profile interface
export interface ClientProfile {
  id: number;
  user_id: string;
  
  // Personal Information
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  gender?: string;
  location?: string;
  
  // Fitness Goals & Preferences  
  goals?: string[]; // e.g. ["mobility", "weight_loss", "strength"]
  preferred_training_style?: TrainingStyle;
  frequency_per_week?: number;
  
  // Health & Medical Information
  physical_limitations?: string;
  medical_conditions?: string[];
  medications?: string;
  
  // Equipment & Activity
  equipment_access?: string[]; // e.g. ["dumbbells", "resistance_bands", "gym_access"]
  activity_level?: ActivityLevel;
  motivation_level?: number; // 1-10 scale
  
  // Privacy & Discovery
  discoverable?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Enhanced Program interface for marketplace
export interface MarketplaceProgram extends Program {
  difficulty?: ProgramDifficulty;
  duration_weeks?: number;
  category?: ProgramCategory;
  price?: number;
  is_public?: boolean;
  equipment_needed?: string[];
  thumbnail_url?: string;
  trainer_name?: string; // Populated from join
  client_program_id?: number; // If user already has this program
  progress_percent?: number; // User's progress if enrolled
  client_status?: ClientProgramStatus; // User's enrollment status
}

// Client Program Assignment interface (updated)
export interface ClientProgramAssignment {
  id: string; // Keep consistent with existing ClientProgram
  client_id: string;
  program_id: number;
  assigned_by?: string; // NULL for self-selected programs
  
  // Progress tracking
  progress_percent: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled'; // Keep existing type
  
  // Timestamps
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Populated from joins
  program_title?: string;
  program_description?: string;
  program_difficulty?: ProgramDifficulty;
  program_duration_weeks?: number;
  program_category?: ProgramCategory;
  program_thumbnail_url?: string;
  trainer_name?: string;
}

// Program marketplace filters
export interface ProgramFilters {
  category?: ProgramCategory;
  difficulty?: ProgramDifficulty;
  duration_weeks?: {
    min?: number;
    max?: number;
  };
  equipment_needed?: string[];
  price?: {
    min?: number;
    max?: number;
    free_only?: boolean;
  };
  search?: string;
  trainer_id?: string;
}