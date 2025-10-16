// User roles in the system
export type UserRole = 'client' | 'trainer' | 'org_manager' | 'admin';

// User organization roles
export type UserOrgRole = 'client' | 'trainer' | 'org_manager';

// User interface
export interface User {
  id: string;  // UUID from Supabase auth
  name: string;
  email: string;
  role: UserRole;
  date_of_birth?: string;  // ISO date string
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  location?: string;
  preferred_language?: string;
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
export type SessionStatus = 'scheduled' | 'completed' | 'canceled';

// Session interface
export interface Session {
  id: number;
  trainer_id: string;  // UUID reference to users table
  client_id: string;   // UUID reference to users table
  org_id?: number;
  scheduled_at: string;  // ISO date string
  status: SessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Program interface
export interface Program {
  id: string;
  title: string;
  name?: string; // Alias for title for backwards compatibility
  description?: string;
  duration_weeks: number;
  difficulty: string;
  difficulty_level?: string; // Alias for difficulty for backwards compatibility
  category?: string;
  is_template?: boolean;
  is_active?: boolean;
  goals?: string[];
  created_by: string;
  org_id?: string;
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
  name: string;
  role: UserRole;
  date_of_birth?: string;  // ISO date string
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  location?: string;
  preferred_language?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Content Library & Exercise Types
export interface Exercise {
  id: string;
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
  id: string;
  program_id: string;
  day_number: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  program_exercises?: ProgramExercise[];
}

export interface ProgramExercise {
  id: string;
  program_day_id: string;
  exercise_id: string;
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
  program_id: string;
  client_id: string;
  assigned_date: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  client?: User;
}

export interface ExerciseLog {
  id: string;
  program_exercise_id: string;
  client_id: string;
  completed_sets?: number;
  completed_reps?: number;
  completed_duration_seconds?: number;
  notes?: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
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