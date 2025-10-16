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
  ClientProgramAssignment,
  ExerciseLog
} from '../types';

export interface CreateExerciseData {
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty_level: string;
  equipment_needed?: string[];
  duration_minutes?: number;
  thumbnail_url?: string;
  video_url?: string;
  is_global?: boolean;
  org_id?: string;
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
  program_id: string;
  day_number: number;
  name: string;
  description?: string;
}

export interface CreateProgramExerciseData {
  program_day_id: string;
  exercise_id: string;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
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
    title: exercise.name, // UI expects 'title'
    difficulty: exercise.difficulty_level, // UI expects 'difficulty'
    equipment: exercise.equipment_needed?.[0] || 'bodyweight', // UI expects single equipment string
    estimated_duration: exercise.duration_minutes, // UI expects 'estimated_duration'
    instructions: exercise.description || '', // Add instructions alias, ensure it's not undefined
    // Add missing fields that the ExerciseCard expects
    name: exercise.name,
    difficulty_level: exercise.difficulty_level,
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
      created_by: user.id,
      is_global: exerciseData.is_global || false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }

  return data;
}

export async function updateExercise(id: string, updates: Partial<CreateExerciseData>): Promise<Exercise> {
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

export async function deleteExercise(id: string): Promise<boolean> {
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
        title,
        description,
        program_exercises(
          id,
          sets,
          reps,
          rest_seconds,
          notes,
          exercise_order,
          exercise:content_library(
            id,
            name,
            description,
            category,
            muscle_groups,
            difficulty_level,
            equipment_needed,
            duration_minutes,
            thumbnail_url,
            video_url
          )
        )
      )
    `, { count: 'exact' })
    .eq('created_by', user.id)
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
      created_by: user.id,
      duration_weeks: programData.duration_weeks,
      difficulty: programData.difficulty,
      is_template: programData.is_template || false,
      goals: programData.goals || ['general_fitness']
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    throw error;
  }

  return data;
}

export async function updateProgram(id: string, updates: Partial<CreateProgramData>): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating program:', error);
    throw error;
  }

  return data;
}

export async function deleteProgram(id: string): Promise<boolean> {
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

export async function deleteProgramDay(id: string): Promise<void> {
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
        name,
        description,
        category,
        muscle_groups,
        difficulty_level,
        equipment_needed,
        duration_minutes,
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

export async function updateProgramExercise(id: string, updates: Partial<CreateProgramExerciseData>): Promise<ProgramExercise> {
  const { data, error } = await supabase
    .from('program_exercises')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      exercise:content_library(
        id,
        name,
        description,
        category,
        muscle_groups,
        difficulty_level,
        equipment_needed,
        duration_minutes,
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

export async function deleteProgramExercise(id: string): Promise<void> {
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
              name,
              description,
              category,
              muscle_groups,
              difficulty_level,
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
    .select('organization_id')
    .eq('user_id', user.id);

  if (!userOrgs || userOrgs.length === 0) return [];

  const orgIds = userOrgs.map(org => org.organization_id);

  // Get clients in those organizations
  const { data: clientOrgs } = await supabase
    .from('user_organizations')
    .select('user_id')
    .in('organization_id', orgIds);

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

export async function assignProgramToClients(programId: string, clientIds: string[]): Promise<void> {
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

export async function unassignProgramFromClient(programId: string, clientId: string): Promise<void> {
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

export async function getProgramAssignments(programId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('client_programs')
    .select(`
      *,
      client:users!client_programs_client_id_fkey(
        id,
        email,
        full_name
      )
    `)
    .eq('program_id', programId);

  if (error) {
    console.error('Error fetching program assignments:', error);
    return [];
  }

  return data || [];
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
        exercise:content_library(name, category),
        program_day:program_days(
          name,
          day_number,
          program:programs(name)
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