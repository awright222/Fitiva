/**
 * Content Library Supabase Service
 * Replaces mock data with real Supabase operations
 */

import { supabase } from './supabase';
import { 
  Exercise, 
  Program, 
  ProgramDay, 
  ProgramExercise,
  ExerciseLog
} from '../types';

export interface CreateExerciseData {
  type?: string; // Optional: 'exercise', 'video', 'pdf', 'article' - defaults to 'exercise'
  title: string;
  description?: string;
  category?: string;
  muscle_groups?: string;  // Database stores as VARCHAR, not array
  difficulty?: string;
  equipment?: string;
  url?: string;
  thumbnail_url?: string;
  video_url?: string;
  org_id?: number; // Should be number, not string
}

export interface CreateProgramData {
  title: string;
  description: string;
  duration_weeks: number;
  difficulty: string;
  is_template?: boolean;
  goals?: string[];
}

export interface CreateProgramDayData {
  program_id: number;
  day_number: number;
  notes?: string; // Matches actual database schema
}

export interface CreateProgramExerciseData {
  program_day_id: number; // Should be number, not string
  exercise_id: number; // Should be number, not string
  sets?: number;
  reps?: number;
  weight?: number;
  percentage?: number;
  rpe?: number;
  notes?: string;
}

// =====================================================
// EXERCISES
// =====================================================

export async function getExercises(filters?: any): Promise<{ exercises: any[]; total: number }> {
  let query = supabase
    .from('content_library')
    .select('*', { count: 'exact' });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { exercises: [], total: 0 };
  }

  // Base filter: user's exercises + global exercises
  query = query.or(`created_by.eq.${user.id},is_global.eq.true`);

  // Apply filters if provided
  if (filters) {
    // Filter by category
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    // Filter by muscle groups
    if (filters.muscle_groups && filters.muscle_groups.length > 0) {
      // For array overlap, we need to use the overlaps operator
      query = query.overlaps('muscle_groups', filters.muscle_groups);
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty.length > 0) {
      query = query.in('difficulty_level', filters.difficulty);
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }

  // Map database fields to UI-compatible format
  const exercises = (data || []).map((exercise: any) => ({
    ...exercise,
    estimated_duration: 30, // Default duration since it's not in the database
    instructions: exercise.description || '', // Add instructions alias, ensure it's not undefined
    // Add legacy field mappings for compatibility
    name: exercise.title, // Map title to name for backward compatibility
    difficulty_level: exercise.difficulty, // Map difficulty to difficulty_level for backward compatibility
  }));

  return {
    exercises,
    total: count || 0
  };
}

export async function createExercise(exerciseData: CreateExerciseData): Promise<Exercise> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('content_library')
    .insert({
      ...exerciseData,
      type: exerciseData.type || 'exercise' // Default to 'exercise' type
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }

  return data;
}

export async function updateExercise(id: number, updates: Partial<CreateExerciseData>): Promise<Exercise> {
  const { data, error } = await supabase
    .from('content_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }

  return data;
}

export async function deleteExercise(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('content_library')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
  
  return true;
}

// =====================================================
// PROGRAMS 
// =====================================================

export interface ProgramListResponse {
  programs: Program[];
  total: number;
}

export async function getPrograms(filters?: any): Promise<ProgramListResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { programs: [], total: 0 };

  const { data, error, count } = await supabase
    .from('programs')
    .select(`
      *,
      program_days(
        id,
        day_number,
        notes,
        program_exercises(
          id,
          sets,
          reps,
          weight,
          percentage,
          rpe,
          notes,
          exercise:content_library(
            id,
            title,
            description,
            category,
            muscle_groups,
            difficulty,
            equipment,
            thumbnail_url,
            video_url
          )
        )
      )
    `, { count: 'exact' })
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }

  // Map database fields to UI-compatible format
  const programs = (data || []).map((program: any) => ({
    ...program,
    name: program.title, // Add name alias for backwards compatibility
    days: program.program_days, // UI expects 'days'
    difficulty_level: program.difficulty, // Add difficulty_level alias
    created_by: program.trainer_id, // Map trainer_id to created_by for UI compatibility
  }));

  return {
    programs,
    total: count || 0
  };
}

export async function createProgram(programData: CreateProgramData): Promise<Program> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('programs')
    .insert({
      title: programData.title,
      description: programData.description,
      trainer_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    throw error;
  }

  return data;
}

export async function updateProgram(id: number, updates: Partial<CreateProgramData>): Promise<Program> {
  // First, let's verify the program exists and we can read it
  console.log('Checking if program exists with ID:', id);
  const { data: existingProgram, error: readError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
    
  console.log('Existing program check - data:', existingProgram, 'error:', readError);
  
  if (!existingProgram) {
    throw new Error(`Program with ID ${id} not found`);
  }

  // Filter out fields that don't exist in the database schema
  const allowedFields = ['title', 'description', 'trainer_id', 'client_id', 'org_id'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = (updates as any)[key];
      return obj;
    }, {});

  console.log('Updating program with filtered data:', filteredUpdates);
  console.log('Program ID being updated:', id, 'type:', typeof id);

  const { data, error } = await supabase
    .from('programs')
    .update(filteredUpdates)
    .eq('id', id)
    .select()
    .single();
    
  console.log('Update result - data:', data, 'error:', error);

  if (error) {
    console.error('Error updating program:', error);
    throw error;
  }

  return data;
}

export async function deleteProgram(id: number): Promise<boolean> {
  // Delete in order due to foreign key constraints
  
  // 1. Get program day IDs
  const { data: programDays } = await supabase
    .from('program_days')
    .select('id')
    .eq('program_id', id);

  if (programDays && programDays.length > 0) {
    const dayIds = programDays.map(day => day.id);

    // Get program exercise IDs
    const { data: programExercises } = await supabase
      .from('program_exercises')
      .select('id')
      .in('program_day_id', dayIds);

    if (programExercises && programExercises.length > 0) {
      const exerciseIds = programExercises.map(ex => ex.id);

      // Delete exercise logs
      await supabase
        .from('exercise_logs')
        .delete()
        .in('program_exercise_id', exerciseIds);
    }

    // Delete program exercises
    await supabase
      .from('program_exercises')
      .delete()
      .in('program_day_id', dayIds);
  }

  // Delete program days
  await supabase
    .from('program_days')
    .delete()
    .eq('program_id', id);

  // Delete client assignments
  await supabase
    .from('client_programs')
    .delete()
    .eq('program_id', id);

  // Delete program
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
  
  return true;
}

// =====================================================
// PROGRAM DAYS
// =====================================================

export async function createProgramDay(dayData: CreateProgramDayData): Promise<ProgramDay> {
  const { data, error } = await supabase
    .from('program_days')
    .insert(dayData)
    .select()
    .single();

  if (error) {
    console.error('Error creating program day:', error);
    throw error;
  }

  return data;
}

export async function updateProgramDay(id: string, updates: Partial<CreateProgramDayData>): Promise<ProgramDay> {
  const { data, error } = await supabase
    .from('program_days')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating program day:', error);
    throw error;
  }

  return data;
}

export async function deleteProgramDay(id: number): Promise<void> {
  // Delete program exercises first
  await supabase
    .from('program_exercises')
    .delete()
    .eq('program_day_id', id);

  const { error } = await supabase
    .from('program_days')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting program day:', error);
    throw error;
  }
}

// =====================================================
// PROGRAM EXERCISES
// =====================================================

export async function createProgramExercise(exerciseData: CreateProgramExerciseData): Promise<ProgramExercise> {
  const { data, error } = await supabase
    .from('program_exercises')
    .insert(exerciseData)
    .select(`
      *,
      exercise:content_library(
        id,
        title,
        description,
        category,
        muscle_groups,
        difficulty,
        equipment,
        thumbnail_url,
        video_url
      )
    `)
    .single();

  if (error) {
    console.error('Error creating program exercise:', error);
    throw error;
  }

  return data;
}

export async function updateProgramExercise(id: number, updates: Partial<CreateProgramExerciseData>): Promise<ProgramExercise> {
  const { data, error } = await supabase
    .from('program_exercises')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      exercise:content_library(
        id,
        title,
        description,
        category,
        muscle_groups,
        difficulty,
        equipment,
        thumbnail_url,
        video_url
      )
    `)
    .single();

  if (error) {
    console.error('Error updating program exercise:', error);
    throw error;
  }

  return data;
}

export async function deleteProgramExercise(id: number): Promise<void> {
  const { error } = await supabase
    .from('program_exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting program exercise:', error);
    throw error;
  }
}

// =====================================================
// CLIENT PROGRAMS & ASSIGNMENTS  
// =====================================================

export async function getClientPrograms(clientId?: string): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const userId = clientId || user.id;

  const { data, error } = await supabase
    .from('client_programs')
    .select(`
      *,
      program:programs(
        id,
        title,
        description,
        duration_weeks,
        difficulty,
        program_days(
          id,
          day_number,
          title,
          description,
          is_rest_day,
          program_exercises(
            id,
            exercise_order,
            sets,
            reps,
            rest_seconds,
            notes,
            exercise:content_library(
              id,
              title,
              description,
              category,
              muscle_groups,
              difficulty,
              thumbnail_url,
              video_url
            )
          )
        )
      )
    `)
    .eq('client_id', userId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching client programs:', error);
    return [];
  }

  return data || [];
}

export async function getClientsForAssignment(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get trainer's organizations first
  const { data: userOrgs } = await supabase
    .from('user_organizations')
    .select('org_id')
    .eq('user_id', user.id);

  if (!userOrgs || userOrgs.length === 0) return [];

  const orgIds = userOrgs.map(org => org.org_id);

  // Get clients in those organizations
  const { data: clientOrgs } = await supabase
    .from('user_organizations')
    .select('user_id')
    .in('org_id', orgIds);

  if (!clientOrgs || clientOrgs.length === 0) return [];

  const clientIds = clientOrgs.map(client => client.user_id);

  // Get client details
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'client')
    .in('id', clientIds);

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data || [];
}

export async function assignProgramToClients(programId: number, clientIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const assignments = clientIds.map(clientId => ({
    program_id: programId,
    client_id: clientId,
    assigned_by: user.id,
    assigned_at: new Date().toISOString(),
    is_active: true
  }));

  const { error } = await supabase
    .from('client_programs')
    .insert(assignments);

  if (error) {
    console.error('Error assigning program to clients:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const saveClientAssignments = assignProgramToClients;

// Alias for getting clients
export const getClients = getClientsForAssignment;

export async function unassignProgramFromClient(programId: number, clientId: string): Promise<void> {
  const { error } = await supabase
    .from('client_programs')
    .delete()
    .eq('program_id', programId)
    .eq('client_id', clientId);

  if (error) {
    console.error('Error unassigning program from client:', error);
    throw error;
  }
}

export async function getProgramAssignments(programId: number): Promise<any[]> {
  // Note: client_programs table doesn't exist in current schema
  // Programs are directly assigned via client_id field in programs table
  // TODO: Implement proper assignment logic based on actual schema
  console.log('getProgramAssignments called for program:', programId);
  return []; // Return empty array for now
}

// =====================================================
// EXERCISE LOGS (for client tracking)
// =====================================================

export async function logExerciseCompletion(data: {
  program_exercise_id: string;
  client_id: string;
  completed_sets?: number;
  completed_reps?: number;
  completed_duration_seconds?: number;
  notes?: string;
  completed_at?: string;
}): Promise<ExerciseLog> {
  const { data: log, error } = await supabase
    .from('exercise_logs')
    .insert({
      ...data,
      completed_at: data.completed_at || new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging exercise completion:', error);
    throw error;
  }

  return log;
}

export async function getExerciseLogs(filters: {
  client_id?: string;
  program_exercise_id?: string;
  date_range?: { start: string; end: string };
}): Promise<ExerciseLog[]> {
  let query = supabase
    .from('exercise_logs')
    .select(`
      *,
      program_exercise:program_exercises(
        *,
        exercise:content_library(title, category),
        program_day:program_days(
          title,
          day_number,
          program:programs(title)
        )
      )
    `);

  if (filters.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  if (filters.program_exercise_id) {
    query = query.eq('program_exercise_id', filters.program_exercise_id);
  }

  if (filters.date_range) {
    query = query
      .gte('completed_at', filters.date_range.start)
      .lte('completed_at', filters.date_range.end);
  }

  const { data, error } = await query.order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercise logs:', error);
    throw error;
  }

  return data || [];
}

// =====================================================
// FILE UPLOAD HELPERS
// =====================================================

export async function uploadExerciseThumbnail(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('exercise-thumbnails')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }

  return data.path;
}

export async function uploadExerciseVideo(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('exercise-videos')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading video:', error);
    throw error;
  }

  return data.path;
}

export function getFilePublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}