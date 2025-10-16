import { supabase } from './supabase';
import type { 
  ClientProgram, 
  Program, 
  ProgramDay, 
  ProgramExercise, 
  Exercise, 
  ExerciseLog 
} from '../types';

/**
 * Client Programs Service
 * Handles all client program-related operations including fetching assigned programs,
 * tracking exercise completion, and updating progress.
 */

export interface ClientProgramWithDetails extends ClientProgram {
  program: Program & {
    program_days: (ProgramDay & {
      program_exercises: (ProgramExercise & {
        exercise: Exercise;
      })[];
    })[];
  };
}

export interface ExerciseCompletionData {
  program_exercise_id: string;
  sets: number;
  reps: string;
  notes?: string;
}

/**
 * Get all programs assigned to a client with full details
 */
export async function getClientPrograms(clientId: string): Promise<ClientProgramWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('client_programs')
      .select(`
        *,
        program:programs!inner (
          *,
          program_days (
            *,
            program_exercises (
              *,
              exercise:content_library!inner (*)
            )
          )
        )
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching client programs:', error);
      throw new Error(`Failed to fetch client programs: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClientPrograms:', error);
    throw error;
  }
}

/**
 * Get a specific client program with all details
 */
export async function getClientProgram(clientProgramId: string): Promise<ClientProgramWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('client_programs')
      .select(`
        *,
        program:programs!inner (
          *,
          program_days (
            *,
            program_exercises (
              *,
              exercise:content_library!inner (*)
            )
          )
        )
      `)
      .eq('id', clientProgramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching client program:', error);
      throw new Error(`Failed to fetch client program: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getClientProgram:', error);
    throw error;
  }
}

/**
 * Get exercises for a specific program day
 */
export async function getProgramDayExercises(programDayId: string): Promise<(ProgramExercise & { exercise: Exercise })[]> {
  try {
    const { data, error } = await supabase
      .from('program_exercises')
      .select(`
        *,
        exercise:content_library!inner (*)
      `)
      .eq('program_day_id', programDayId)
      .order('exercise_order', { ascending: true });

    if (error) {
      console.error('Error fetching program day exercises:', error);
      throw new Error(`Failed to fetch program day exercises: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProgramDayExercises:', error);
    throw error;
  }
}

/**
 * Log exercise completion
 */
export async function logExerciseCompletion(
  clientProgramId: string,
  completionData: ExerciseCompletionData
): Promise<ExerciseLog> {
  try {
    const { data, error } = await supabase
      .from('exercise_logs')
      .insert({
        client_program_id: clientProgramId,
        program_exercise_id: completionData.program_exercise_id,
        completed_at: new Date().toISOString(),
        actual_sets: completionData.sets,
        actual_reps: completionData.reps,
        notes: completionData.notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging exercise completion:', error);
      throw new Error(`Failed to log exercise completion: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in logExerciseCompletion:', error);
    throw error;
  }
}

/**
 * Get exercise logs for a client program
 */
export async function getExerciseLogs(clientProgramId: string): Promise<ExerciseLog[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('client_program_id', clientProgramId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching exercise logs:', error);
      throw new Error(`Failed to fetch exercise logs: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getExerciseLogs:', error);
    throw error;
  }
}

/**
 * Update client program progress
 */
export async function updateClientProgramProgress(
  clientProgramId: string,
  updates: {
    completion_percentage?: number;
    current_day?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('client_programs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientProgramId);

    if (error) {
      console.error('Error updating client program progress:', error);
      throw new Error(`Failed to update client program progress: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateClientProgramProgress:', error);
    throw error;
  }
}

/**
 * Check if an exercise has been completed today
 */
export async function isExerciseCompletedToday(
  clientProgramId: string,
  programExerciseId: string
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('exercise_logs')
      .select('id')
      .eq('client_program_id', clientProgramId)
      .eq('program_exercise_id', programExerciseId)
      .gte('completed_at', today.toISOString())
      .lt('completed_at', tomorrow.toISOString())
      .limit(1);

    if (error) {
      console.error('Error checking exercise completion:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in isExerciseCompletedToday:', error);
    return false;
  }
}

/**
 * Calculate program completion percentage
 */
export async function calculateProgramCompletion(clientProgramId: string): Promise<number> {
  try {
    // Get total exercises in the program
    const { data: programData, error: programError } = await supabase
      .from('client_programs')
      .select(`
        program:programs!inner (
          program_days!inner (
            program_exercises!inner (id)
          )
        )
      `)
      .eq('id', clientProgramId)
      .single();

    if (programError) {
      console.error('Error fetching program structure:', programError);
      return 0;
    }

    // Count total exercises  
    const totalExercises = (programData.program as any).program_days
      .reduce((total: number, day: any) => total + day.program_exercises.length, 0);

    if (totalExercises === 0) return 0;

    // Count completed exercises
    const { data: completedData, error: completedError } = await supabase
      .from('exercise_logs')
      .select('program_exercise_id')
      .eq('client_program_id', clientProgramId);

    if (completedError) {
      console.error('Error fetching completed exercises:', completedError);
      return 0;
    }

    // Get unique completed exercises (in case same exercise was done multiple times)
    const uniqueCompletedExercises = new Set(
      completedData.map(log => log.program_exercise_id)
    ).size;

    return Math.round((uniqueCompletedExercises / totalExercises) * 100);
  } catch (error) {
    console.error('Error in calculateProgramCompletion:', error);
    return 0;
  }
}