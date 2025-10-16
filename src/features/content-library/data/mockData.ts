/**
 * Content Library Mock Data
 * 
 * This file contains mock data for exercises, programs, and related functionality
 * to support development and testing of the content library feature.
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Exercise Data (content_library table):
 *    - Replace mockExercises with: supabase.from('content_library').select('*')
 *    - Add RLS policies for trainer/client access control
 *    - Enable file uploads to 'exercise-thumbnails' and 'exercise-videos' buckets
 * 
 * 2. Program Data (programs, program_days, program_exercises tables):
 *    - Replace with complex joins across multiple tables
 *    - Use: supabase.from('programs').select('*, days:program_days(*, exercises:program_exercises(*, exercise:content_library(*)))')
 * 
 * 3. Client Assignments (client_programs table):
 *    - Track program assignments and progress
 *    - Real-time updates for completion tracking
 * 
 * 4. File Upload Integration:
 *    - uploadExerciseThumbnail() -> supabase.storage.from('exercise-thumbnails').upload()
 *    - uploadExerciseVideo() -> supabase.storage.from('exercise-videos').upload()
 *    - Progress tracking for uploads
 * 
 * All functions below will be replaced with real Supabase queries and mutations.
 */

import type {
  Exercise,
  Program,
  ProgramDay,
  ProgramExercise,
  ClientProgram,
  ExerciseLog,
  ExerciseFilters,
  ProgramFilters,
  ExerciseListResponse,
  ProgramListResponse,
  MuscleGroup,
  EquipmentType,
  DifficultyLevel,
  ExerciseCategory,
} from '../types';

// ===================================
// Mock Exercise Data
// ===================================

export const mockExercises: Exercise[] = [
  // Bodyweight Exercises
  {
    id: 'ex_1',
    title: 'Push-ups',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps. Perfect for building upper body strength.',
    instructions: '1. Start in plank position with hands shoulder-width apart\n2. Lower your chest until it nearly touches the floor\n3. Push back up to starting position\n4. Keep your body in a straight line throughout',
    difficulty: 'beginner',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders', 'core'],
    equipment: 'bodyweight',
    estimated_duration: 5,
    thumbnail_url: 'https://example.com/thumbnails/pushups.jpg',
    video_url: 'https://example.com/videos/pushups.mp4',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Keep wrists aligned under shoulders. Modify by dropping to knees if needed.',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ex_2',
    title: 'Bodyweight Squats',
    description: 'Fundamental lower body exercise that strengthens legs and glutes while improving mobility.',
    instructions: '1. Stand with feet shoulder-width apart\n2. Lower by pushing hips back and bending knees\n3. Descend until thighs are parallel to floor\n4. Drive through heels to return to standing',
    difficulty: 'beginner',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    equipment: 'bodyweight',
    estimated_duration: 5,
    thumbnail_url: 'https://example.com/thumbnails/squats.jpg',
    video_url: 'https://example.com/videos/squats.mp4',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Keep knees tracking over toes. Start with partial range if mobility is limited.',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'ex_3',
    title: 'Plank',
    description: 'Isometric core exercise that builds stability and strength throughout the entire torso.',
    instructions: '1. Start in forearm plank position\n2. Keep body in straight line from head to heels\n3. Engage core and breathe normally\n4. Hold for prescribed time',
    difficulty: 'beginner',
    category: 'strength',
    muscle_groups: ['core', 'shoulders', 'back'],
    equipment: 'bodyweight',
    estimated_duration: 3,
    thumbnail_url: 'https://example.com/thumbnails/plank.jpg',
    video_url: 'https://example.com/videos/plank.mp4',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Avoid sagging hips or raising butt too high. Modify on knees if needed.',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
  },
  // Dumbbell Exercises
  {
    id: 'ex_4',
    title: 'Dumbbell Chest Press',
    description: 'Effective chest-building exercise using dumbbells for a full range of motion.',
    instructions: '1. Lie on bench with dumbbells at chest level\n2. Press weights up and slightly together\n3. Lower with control to starting position\n4. Keep shoulder blades retracted',
    difficulty: 'intermediate',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: 'dumbbells',
    estimated_duration: 8,
    thumbnail_url: 'https://example.com/thumbnails/db-chest-press.jpg',
    video_url: 'https://example.com/videos/db-chest-press.mp4',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Use spotter for heavy weights. Start light to perfect form.',
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z',
  },
  {
    id: 'ex_5',
    title: 'Dumbbell Rows',
    description: 'Unilateral back exercise that improves strength and corrects muscle imbalances.',
    instructions: '1. Place one knee and hand on bench\n2. Hold dumbbell in opposite hand\n3. Pull weight to ribcage\n4. Lower with control',
    difficulty: 'intermediate',
    category: 'strength',
    muscle_groups: ['back', 'biceps', 'core'],
    equipment: 'dumbbells',
    estimated_duration: 8,
    thumbnail_url: 'https://example.com/thumbnails/db-rows.jpg',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Keep back flat and core engaged throughout movement.',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
  },
  // Cardio Exercises
  {
    id: 'ex_6',
    title: 'Walking in Place',
    description: 'Low-impact cardio exercise perfect for seniors or those with mobility limitations.',
    instructions: '1. Stand with good posture\n2. Lift knees alternately\n3. Swing arms naturally\n4. Maintain steady rhythm',
    difficulty: 'beginner',
    category: 'cardio',
    muscle_groups: ['legs', 'core'],
    equipment: 'bodyweight',
    estimated_duration: 10,
    thumbnail_url: 'https://example.com/thumbnails/walking-in-place.jpg',
    video_url: 'https://example.com/videos/walking-in-place.mp4',
    is_global: true,
    created_by: 'trainer_1',
    safety_notes: 'Start slowly and build up intensity. Stay hydrated.',
    created_at: '2024-01-15T12:30:00Z',
    updated_at: '2024-01-15T12:30:00Z',
  },
  // Custom Trainer Exercise
  {
    id: 'ex_7',
    title: 'Modified Yoga Flow',
    description: 'Gentle yoga sequence designed specifically for senior clients to improve flexibility.',
    instructions: '1. Start in seated position\n2. Gentle neck rolls\n3. Shoulder blade squeezes\n4. Seated spinal twist',
    difficulty: 'beginner',
    category: 'flexibility',
    muscle_groups: ['full_body'],
    equipment: 'none',
    estimated_duration: 15,
    is_global: false, // Trainer-specific exercise
    created_by: 'trainer_2',
    safety_notes: 'Move slowly and never force any position. Stop if you feel pain.',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
  },
];

// ===================================
// Mock Program Data
// ===================================

export const mockPrograms: Program[] = [
  {
    id: 'prog_1',
    title: 'Beginner Full Body Strength',
    description: 'A comprehensive 4-week program designed for seniors new to strength training. Focuses on functional movements and building confidence.',
    created_by: 'trainer_1',
    is_template: true,
    duration_weeks: 4,
    difficulty: 'beginner',
    goals: ['strength_building', 'functional_movement', 'confidence'],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    total_exercises: 12,
    estimated_duration: 30,
  },
  {
    id: 'prog_2', 
    title: 'Senior Mobility & Balance',
    description: 'Gentle 6-week program focusing on improving flexibility, balance, and daily movement quality.',
    created_by: 'trainer_1',
    is_template: true,
    duration_weeks: 6,
    difficulty: 'beginner',
    goals: ['flexibility', 'balance', 'mobility'],
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    total_exercises: 8,
    estimated_duration: 25,
  },
];

export const mockProgramDays: ProgramDay[] = [
  // Program 1 Days
  {
    id: 'day_1',
    program_id: 'prog_1',
    day_number: 1,
    title: 'Upper Body Foundation',
    description: 'Introduction to upper body movements with focus on form and control.',
    is_rest_day: false,
    created_at: '2024-01-10T00:00:00Z',
    total_exercises: 4,
    estimated_duration: 30,
  },
  {
    id: 'day_2',
    program_id: 'prog_1',
    day_number: 2,
    title: 'Lower Body Basics',
    description: 'Building leg strength and stability with bodyweight movements.',
    is_rest_day: false,
    created_at: '2024-01-10T00:00:00Z',
    total_exercises: 4,
    estimated_duration: 30,
  },
  {
    id: 'day_3',
    program_id: 'prog_1',
    day_number: 3,
    title: 'Active Recovery',
    description: 'Gentle movement and stretching to promote recovery.',
    is_rest_day: true,
    created_at: '2024-01-10T00:00:00Z',
    total_exercises: 2,
    estimated_duration: 15,
  },
];

export const mockProgramExercises: ProgramExercise[] = [
  // Day 1 Exercises
  {
    id: 'pex_1',
    program_day_id: 'day_1',
    exercise_id: 'ex_1', // Push-ups
    order_index: 1,
    sets: 3,
    reps: '5-8',
    rpe: 6,
    rest_seconds: 60,
    notes: 'Focus on form over quantity. Modify on knees if needed.',
    is_superset: false,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'pex_2',
    program_day_id: 'day_1',
    exercise_id: 'ex_3', // Plank
    order_index: 2,
    sets: 3,
    reps: '20-30 seconds',
    rpe: 5,
    rest_seconds: 45,
    notes: 'Build up holding time gradually. Quality over duration.',
    is_superset: false,
    created_at: '2024-01-10T00:00:00Z',
  },
  // Day 2 Exercises
  {
    id: 'pex_3',
    program_day_id: 'day_2',
    exercise_id: 'ex_2', // Squats
    order_index: 1,
    sets: 3,
    reps: '8-12',
    rpe: 6,
    rest_seconds: 75,
    notes: 'Focus on sitting back into the movement. Use chair for support if needed.',
    is_superset: false,
    created_at: '2024-01-10T00:00:00Z',
  },
];

// ===================================
// Mock Client Program Assignments
// ===================================

export const mockClientPrograms: ClientProgram[] = [
  {
    id: 'cp_1',
    client_id: 'client_1', // John Doe
    program_id: 'prog_1',
    assigned_by: 'trainer_1',
    assigned_at: '2024-01-15T00:00:00Z',
    start_date: '2024-01-15',
    is_active: true,
    completion_percentage: 45.5,
    assigned_by_name: 'Sarah Wilson',
    days_completed: 5,
    total_days: 12,
  },
  {
    id: 'cp_2',
    client_id: 'client_2', // Emma Davis
    program_id: 'prog_2',
    assigned_by: 'trainer_1',
    assigned_at: '2024-01-10T00:00:00Z',
    start_date: '2024-01-10',
    is_active: true,
    completion_percentage: 78.2,
    assigned_by_name: 'Sarah Wilson',
    days_completed: 14,
    total_days: 18,
  },
];

// ===================================
// Mock Exercise Logs
// ===================================

export const mockExerciseLogs: ExerciseLog[] = [
  {
    id: 'log_1',
    client_id: 'client_1',
    program_exercise_id: 'pex_1',
    completed_at: '2024-01-15T15:30:00Z',
    actual_sets: 3,
    actual_reps: '6,5,4',
    actual_rpe: 7,
    notes: 'Felt strong today, could probably do more next time.',
    session_date: '2024-01-15',
  },
  {
    id: 'log_2',
    client_id: 'client_1',
    program_exercise_id: 'pex_2',
    completed_at: '2024-01-15T15:35:00Z',
    actual_sets: 3,
    actual_reps: '25 sec, 20 sec, 15 sec',
    actual_rpe: 6,
    notes: 'Plank is getting easier!',
    session_date: '2024-01-15',
  },
];

// ===================================
// Helper Functions (TODO: Replace with Supabase)
// ===================================

// TODO: Replace with: supabase.from('content_library').select('*').match(filters)
export const getExercises = async (filters?: ExerciseFilters): Promise<ExerciseListResponse> => {
  let filteredExercises = [...mockExercises];
  
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredExercises = filteredExercises.filter(ex => 
        ex.title.toLowerCase().includes(searchLower) ||
        ex.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.muscle_groups?.length) {
      filteredExercises = filteredExercises.filter(ex =>
        filters.muscle_groups!.some(mg => ex.muscle_groups.includes(mg))
      );
    }
    
    if (filters.equipment?.length) {
      filteredExercises = filteredExercises.filter(ex =>
        filters.equipment!.includes(ex.equipment)
      );
    }
    
    if (filters.difficulty?.length) {
      filteredExercises = filteredExercises.filter(ex =>
        filters.difficulty!.includes(ex.difficulty)
      );
    }
    
    if (filters.category?.length) {
      filteredExercises = filteredExercises.filter(ex =>
        filters.category!.includes(ex.category)
      );
    }
    
    if (filters.created_by) {
      filteredExercises = filteredExercises.filter(ex =>
        ex.created_by === filters.created_by
      );
    }
    
    if (typeof filters.is_global === 'boolean') {
      filteredExercises = filteredExercises.filter(ex =>
        ex.is_global === filters.is_global
      );
    }
    
    if (filters.has_video) {
      filteredExercises = filteredExercises.filter(ex => !!ex.video_url);
    }
    
    if (filters.has_thumbnail) {
      filteredExercises = filteredExercises.filter(ex => !!ex.thumbnail_url);
    }
  }
  
  return {
    exercises: filteredExercises,
    total_count: filteredExercises.length,
    page: 1,
    per_page: 50,
    has_more: false,
  };
};

// TODO: Replace with: supabase.from('content_library').select('*').eq('id', id).single()
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  return mockExercises.find(ex => ex.id === id) || null;
};

// TODO: Replace with: supabase.from('programs').select('*, days:program_days(*, exercises:program_exercises(*, exercise:content_library(*)))').match(filters)
export const getPrograms = async (filters?: ProgramFilters): Promise<ProgramListResponse> => {
  let filteredPrograms = [...mockPrograms];
  
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPrograms = filteredPrograms.filter(prog =>
        prog.title.toLowerCase().includes(searchLower) ||
        prog.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.difficulty?.length) {
      filteredPrograms = filteredPrograms.filter(prog =>
        filters.difficulty!.includes(prog.difficulty)
      );
    }
    
    if (filters.created_by) {
      filteredPrograms = filteredPrograms.filter(prog =>
        prog.created_by === filters.created_by
      );
    }
  }
  
  return {
    programs: filteredPrograms,
    total_count: filteredPrograms.length,
    page: 1,
    per_page: 20,
    has_more: false,
  };
};

// TODO: Replace with: supabase.from('programs').select('*, days:program_days(*, exercises:program_exercises(*, exercise:content_library(*)))').eq('id', id).single()
export const getProgramById = async (id: string): Promise<Program | null> => {
  const program = mockPrograms.find(p => p.id === id);
  if (!program) return null;
  
  // Populate with days and exercises
  const days = mockProgramDays.filter(d => d.program_id === id);
  const programWithDays = {
    ...program,
    days: days.map(day => ({
      ...day,
      exercises: mockProgramExercises
        .filter(pex => pex.program_day_id === day.id)
        .map(pex => ({
          ...pex,
          exercise: mockExercises.find(ex => ex.id === pex.exercise_id),
        })),
    })),
  };
  
  return programWithDays;
};

// TODO: Replace with: supabase.from('client_programs').select('*, program:programs(*)').eq('client_id', clientId)
export const getClientPrograms = async (clientId: string): Promise<ClientProgram[]> => {
  const clientPrograms = mockClientPrograms.filter(cp => cp.client_id === clientId);
  
  // Populate with full program data including days and exercises
  const programsWithData = await Promise.all(
    clientPrograms.map(async cp => ({
      ...cp,
      program: await getProgramById(cp.program_id),
    }))
  );
  
  return programsWithData.filter(cp => cp.program !== null) as ClientProgram[];
};

// TODO: Replace with: supabase.from('content_library').insert(exerciseData).select().single()
export const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> => {
  const newExercise: Exercise = {
    ...exerciseData,
    id: `ex_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockExercises.push(newExercise);
  return newExercise;
};

// TODO: Replace with: supabase.from('content_library').update(updates).eq('id', id).select().single()
export const updateExercise = async (id: string, updates: Partial<Exercise>): Promise<Exercise | null> => {
  const index = mockExercises.findIndex(ex => ex.id === id);
  if (index === -1) return null;
  
  mockExercises[index] = {
    ...mockExercises[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  return mockExercises[index];
};

// TODO: Replace with: supabase.from('content_library').delete().eq('id', id)
export const deleteExercise = async (id: string): Promise<boolean> => {
  const index = mockExercises.findIndex(ex => ex.id === id);
  if (index === -1) return false;
  
  mockExercises.splice(index, 1);
  return true;
};

// Create new program
// TODO: Replace with Supabase transaction (programs + program_days + program_exercises)
export const createProgram = async (program: Omit<Program, 'id' | 'created_at' | 'updated_at'>): Promise<Program> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const newProgram: Program = {
    ...program,
    id: `program_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Add to mock data
  mockPrograms.unshift(newProgram);
  console.log('Created program:', newProgram);
  return newProgram;
};

// TODO: Replace with: supabase.storage.from('exercise-thumbnails').upload()
export const uploadExerciseThumbnail = async (file: File, exerciseId: string): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock URL
  return `https://example.com/thumbnails/${exerciseId}_${Date.now()}.jpg`;
};

// TODO: Replace with: supabase.storage.from('exercise-videos').upload()
export const uploadExerciseVideo = async (file: File, exerciseId: string): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return mock URL
  return `https://example.com/videos/${exerciseId}_${Date.now()}.mp4`;
};

// TODO: Replace with: supabase.from('client_exercise_logs').insert(logData).select().single()
export const logExerciseCompletion = async (logData: Omit<ExerciseLog, 'id' | 'completed_at'>): Promise<ExerciseLog> => {
  const newLog: ExerciseLog = {
    ...logData,
    id: `log_${Date.now()}`,
    completed_at: new Date().toISOString(),
  };
  
  mockExerciseLogs.push(newLog);
  return newLog;
};

// ===================================
// Constants and Helpers
// ===================================

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps',
  'core', 'abs', 'obliques', 'lower_back',
  'legs', 'quadriceps', 'hamstrings', 'glutes', 'calves',
  'full_body', 'cardio'
];

export const EQUIPMENT_TYPES: EquipmentType[] = [
  'bodyweight', 'dumbbells', 'barbell', 'resistance_bands',
  'kettlebell', 'medicine_ball', 'cable_machine', 'bench',
  'pull_up_bar', 'treadmill', 'stationary_bike', 'none'
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'beginner', 'intermediate', 'advanced'
];

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'strength', 'cardio', 'flexibility', 'balance',
  'mobility', 'rehabilitation', 'warm_up', 'cool_down'
];

export const FITNESS_GOALS = [
  'weight_loss', 'muscle_gain', 'strength_building', 'endurance',
  'flexibility', 'balance', 'functional_movement', 'rehabilitation',
  'general_fitness', 'confidence', 'stress_relief'
];