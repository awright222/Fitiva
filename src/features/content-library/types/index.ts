/**
 * Content Library and Program Builder Type Definitions
 * 
 * This file contains all TypeScript interfaces for the content library feature,
 * including exercises, programs, and related data structures.
 * 
 * SUPABASE INTEGRATION POINTS:
 * ============================
 * 
 * All interfaces here correspond directly to Supabase database tables:
 * - Exercise -> content_library table
 * - Program -> programs table  
 * - ProgramDay -> program_days table
 * - ProgramExercise -> program_exercises table
 * - ClientProgram -> client_programs table
 * - ExerciseLog -> client_exercise_logs table
 * 
 * These types ensure type safety across the entire content library system.
 */

// ===================================
// Core Exercise Types
// ===================================

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'biceps' | 'triceps'
  | 'core' | 'abs' | 'obliques' | 'lower_back'
  | 'legs' | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves'
  | 'full_body' | 'cardio';

export type ExerciseCategory = 
  | 'strength' | 'cardio' | 'flexibility' | 'balance' 
  | 'mobility' | 'rehabilitation' | 'warm_up' | 'cool_down';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type EquipmentType = 
  | 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands'
  | 'kettlebell' | 'medicine_ball' | 'cable_machine' | 'bench'
  | 'pull_up_bar' | 'treadmill' | 'stationary_bike' | 'none';

// ===================================
// Exercise Interface
// ===================================

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: DifficultyLevel;
  category: ExerciseCategory;
  muscle_groups: MuscleGroup[];
  equipment: EquipmentType;
  estimated_duration: number; // Duration in minutes
  thumbnail_url?: string; // URL to exercise image
  video_url?: string; // URL to demo video
  is_global: boolean; // Global exercises visible to all users
  created_by: string; // User ID who created the exercise
  org_id?: string; // Organization ID (null for DTC/global)
  safety_notes?: string;
  created_at: string;
  updated_at: string;
  
  // UI/Display helpers (not stored in DB)
  is_favorite?: boolean; // Client favorited this exercise
  last_performed?: string; // When client last did this exercise
}

// ===================================
// Program Structure Types
// ===================================

export interface Program {
  id: string;
  title: string;
  description: string;
  created_by: string; // Trainer who created the program
  org_id?: string;
  is_template: boolean; // Template vs assigned program
  duration_weeks: number;
  difficulty: DifficultyLevel;
  goals: string[]; // Fitness goals like "weight_loss", "muscle_gain"
  created_at: string;
  updated_at: string;
  
  // Populated via joins
  days?: ProgramDay[];
  total_exercises?: number;
  estimated_duration?: number; // Total program duration in minutes per session
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  title: string; // e.g., "Push Day", "Leg Day", "Rest Day"
  description?: string;
  is_rest_day: boolean;
  created_at: string;
  
  // Populated via joins
  exercises?: ProgramExercise[];
  total_exercises?: number;
  estimated_duration?: number; // Day duration in minutes
}

export interface ProgramExercise {
  id: string;
  program_day_id: string;
  exercise_id: string;
  order_index: number; // Order within the day
  sets: number;
  reps: string; // e.g., "8-12", "AMRAP", "30 seconds"
  weight_kg?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rest_seconds?: number;
  notes?: string;
  is_superset: boolean;
  superset_group?: number; // Group superset exercises together
  created_at: string;
  
  // Populated via joins
  exercise?: Exercise; // Full exercise details
}

// ===================================
// Client Program Assignment Types
// ===================================

export interface ClientProgram {
  id: string;
  client_id: string;
  program_id: string;
  assigned_by: string; // Trainer who assigned the program
  assigned_at: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  completion_percentage: number; // 0-100
  
  // Populated via joins
  program?: Program;
  assigned_by_name?: string; // Trainer name
  days_completed?: number;
  total_days?: number;
}

export interface ExerciseLog {
  id: string;
  client_id: string;
  program_exercise_id: string;
  completed_at: string;
  actual_sets: number;
  actual_reps: string;
  actual_weight_kg?: number;
  actual_rpe?: number;
  notes?: string;
  session_date: string;
  
  // Populated via joins
  exercise?: Exercise;
  program_exercise?: ProgramExercise;
}

// ===================================
// UI and Form Types
// ===================================

export interface ExerciseFormData {
  title: string;
  description: string;
  instructions: string;
  difficulty: DifficultyLevel;
  category: ExerciseCategory;
  muscle_groups: MuscleGroup[];
  equipment: EquipmentType;
  estimated_duration: number;
  safety_notes?: string;
  thumbnail_file?: File; // For upload
  video_file?: File; // For upload
}

export interface ProgramFormData {
  title: string;
  description: string;
  duration_weeks: number;
  difficulty: DifficultyLevel;
  goals: string[];
  days: ProgramDayFormData[];
}

export interface ProgramDayFormData {
  day_number: number;
  title: string;
  description?: string;
  is_rest_day: boolean;
  exercises: ProgramExerciseFormData[];
}

export interface ProgramExerciseFormData {
  exercise_id: string;
  sets: number;
  reps: string;
  weight_kg?: number;
  rpe?: number;
  rest_seconds?: number;
  notes?: string;
  is_superset: boolean;
  superset_group?: number;
}

// ===================================
// Filter and Search Types
// ===================================

export interface ExerciseFilters {
  search?: string;
  muscle_groups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel[];
  category?: ExerciseCategory[];
  created_by?: string; // Filter by creator
  is_global?: boolean;
  has_video?: boolean;
  has_thumbnail?: boolean;
}

export interface ProgramFilters {
  search?: string;
  difficulty?: DifficultyLevel[];
  goals?: string[];
  duration_weeks_min?: number;
  duration_weeks_max?: number;
  created_by?: string;
  is_template?: boolean;
}

// ===================================
// API Response Types
// ===================================

export interface ExerciseListResponse {
  exercises: Exercise[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ProgramListResponse {
  programs: Program[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ===================================
// Upload and Media Types
// ===================================

export interface UploadProgress {
  progress: number; // 0-100
  uploaded_bytes: number;
  total_bytes: number;
  is_complete: boolean;
  error?: string;
}

export interface MediaUploadResult {
  url: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_progress?: UploadProgress;
}

// ===================================
// Analytics and Progress Types
// ===================================

export interface ExerciseProgress {
  exercise_id: string;
  exercise_title: string;
  total_sessions: number;
  best_weight?: number;
  best_reps?: string;
  average_rpe?: number;
  last_performed: string;
  trend: 'improving' | 'maintaining' | 'declining';
  progress_percentage: number; // 0-100
}

export interface ProgramProgress {
  program_id: string;
  completion_percentage: number;
  days_completed: number;
  total_days: number;
  exercises_completed: number;
  total_exercises: number;
  current_week: number;
  average_session_duration: number; // Minutes
  consistency_score: number; // 0-100
}

// ===================================
// AI Suggestions (Future Feature)
// ===================================

export interface ExerciseSuggestion {
  exercise: Exercise;
  relevance_score: number; // 0-100
  reason: string; // Why this exercise was suggested
  category: 'similar_muscle_group' | 'progressive_overload' | 'complementary' | 'recovery';
}

export interface ProgramSuggestion {
  program: Program;
  match_score: number; // 0-100
  reasons: string[];
  estimated_success_rate: number; // 0-100
}

// ===================================
// Error and Validation Types
// ===================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ContentLibraryError {
  type: 'validation' | 'upload' | 'permission' | 'network' | 'server';
  message: string;
  details?: ValidationError[];
}

// ===================================
// Feature Flag Types
// ===================================

export interface ContentLibraryFeatures {
  CONTENT_LIBRARY_ENABLED: boolean;
  PROGRAM_BUILDER_ENABLED: boolean;
  EXERCISE_UPLOADS_ENABLED: boolean;
  WHITE_LABEL_ENABLED: boolean;
  AI_SUGGESTIONS_ENABLED: boolean;
}

// ===================================
// Export all types
// ===================================

export type {
  // Re-export for convenience
  Exercise as ContentLibraryExercise,
  Program as FitnessProgram,
  ProgramDay as FitnessProgramDay,
  ProgramExercise as FitnessProgramExercise,
  ClientProgram as AssignedProgram,
  ExerciseLog as WorkoutLog,
};