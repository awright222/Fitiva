/**
 * Types for the scheduling feature
 */

export type SessionStatus = 'scheduled' | 'completed' | 'canceled' | 'pending';

export interface Session {
  id: string;
  trainer_id: string;
  client_id: string;
  org_id?: string;
  scheduled_at: string; // ISO timestamp
  status: SessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  trainer_name?: string;
  client_name?: string;
  duration_minutes?: number;
  session_type?: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  hourly_rate: number;
  rating?: number;
  bio?: string;
}

export interface TrainerAvailability {
  trainer_id: string;
  trainer_name: string;
  specialties: string[];
  available_slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
}

export interface SessionRequest {
  trainer_id: string;
  client_id: string;
  scheduled_at: string;
  notes?: string;
  session_type?: string;
  duration_minutes?: number;
}

export interface ScheduleViewMode {
  mode: 'list' | 'calendar';
  period: 'day' | 'week' | 'month';
}