/**
 * Mock data for scheduling feature
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Sessions Table (sessions):
 *    - Replace mockSessions with: supabase.from('sessions').select('*')
 *    - Add RLS policies for trainer/client access control
 *    - Enable real-time subscriptions for live updates
 * 
 * 2. Trainers Table (trainers):
 *    - Replace mockTrainers with: supabase.from('trainers').select('*')
 *    - Join with user profiles for additional trainer info
 * 
 * 3. Trainer Availability (trainer_availability):
 *    - Replace mockTrainerAvailability with database queries
 *    - Implement recurring availability patterns
 *    - Handle time zone conversions
 * 
 * 4. Real-time Features:
 *    - Session status changes: supabase.channel('sessions').on('UPDATE')
 *    - New bookings: supabase.channel('sessions').on('INSERT') 
 *    - Availability updates: supabase.channel('trainer_availability').on('UPDATE')
 * 
 * 5. Functions to Replace:
 *    - getSessionsByTrainer() -> supabase.from('sessions').select().eq('trainer_id', id)
 *    - getSessionsByClient() -> supabase.from('sessions').select().eq('client_id', id)
 *    - createSession() -> supabase.from('sessions').insert()
 *    - updateSessionStatus() -> supabase.from('sessions').update().eq('id', id)
 * 
 * This will be replaced with real Supabase queries later
 */

import { Session, TrainerAvailability, TimeSlot, Trainer } from '../types';

// Mock trainers data
export const mockTrainers: Trainer[] = [
  {
    id: '2',
    name: 'Sarah Wilson',
    specialty: 'Strength Training & Rehabilitation',
    hourly_rate: 75,
    rating: 4.8,
    bio: 'Certified personal trainer with 8+ years experience in strength training and injury rehabilitation.',
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    specialty: 'Cardio & Weight Loss',
    hourly_rate: 65,
    rating: 4.7,
    bio: 'Fitness enthusiast specializing in cardio workouts and sustainable weight loss programs.',
  },
  {
    id: '4',
    name: 'Jennifer Park',
    specialty: 'Yoga & Flexibility',
    hourly_rate: 70,
    rating: 4.9,
    bio: 'Yoga instructor and flexibility specialist focused on mindful movement and mobility.',
  },
  {
    id: '8',
    name: 'Marcus Johnson',
    specialty: 'CrossFit & Athletic Training',
    hourly_rate: 80,
    rating: 4.8,
    bio: 'Former athlete specializing in CrossFit training and sports performance enhancement.',
  },
];

// Helper function to generate dates
const getDateString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const getDateOnlyString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Mock sessions data
export const mockSessions: Session[] = [
  {
    id: '1',
    trainer_id: '2', // Test Trainer
    client_id: '1', // Test Client
    scheduled_at: getDateString(1), // Tomorrow
    status: 'scheduled',
    notes: 'Focus on upper body strength training',
    created_at: getDateString(-2),
    updated_at: getDateString(-1),
    trainer_name: 'Test Trainer',
    client_name: 'Test Client',
    duration_minutes: 60,
    session_type: 'Personal Training',
  },
  {
    id: '2',
    trainer_id: '2',
    client_id: '1',
    scheduled_at: getDateString(3), // 3 days from now
    status: 'scheduled',
    notes: 'Cardio and core workout',
    created_at: getDateString(-1),
    updated_at: getDateString(-1),
    trainer_name: 'Test Trainer',
    client_name: 'Test Client',
    duration_minutes: 45,
    session_type: 'Cardio Session',
  },
  {
    id: '3',
    trainer_id: '2',
    client_id: '4', // Another client
    scheduled_at: getDateString(0), // Today
    status: 'completed',
    notes: 'Completed full body workout',
    created_at: getDateString(-3),
    updated_at: getDateString(0),
    trainer_name: 'Test Trainer',
    client_name: 'Sarah Johnson',
    duration_minutes: 60,
    session_type: 'Full Body Workout',
  },
  {
    id: '4',
    trainer_id: '2',
    client_id: '5',
    scheduled_at: getDateString(-1), // Yesterday
    status: 'completed',
    notes: 'Strength training session completed',
    created_at: getDateString(-4),
    updated_at: getDateString(-1),
    trainer_name: 'Test Trainer',
    client_name: 'Mike Chen',
    duration_minutes: 60,
    session_type: 'Strength Training',
  },
  {
    id: '5',
    trainer_id: '2',
    client_id: '6',
    scheduled_at: getDateString(2),
    status: 'pending',
    notes: 'New client consultation and assessment',
    created_at: getDateString(0),
    updated_at: getDateString(0),
    trainer_name: 'Test Trainer',
    client_name: 'Emma Davis',
    duration_minutes: 90,
    session_type: 'Initial Consultation',
  },
];

// Generate time slots for the next 7 days
const generateTimeSlots = (trainerId: string, daysFromNow: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const date = getDateOnlyString(daysFromNow);
  
  // Morning slots (9 AM - 12 PM)
  const morningTimes = ['09:00', '10:00', '11:00'];
  // Afternoon slots (2 PM - 6 PM)
  const afternoonTimes = ['14:00', '15:00', '16:00', '17:00'];
  
  [...morningTimes, ...afternoonTimes].forEach((startTime, index) => {
    const endTime = `${parseInt(startTime.split(':')[0]) + 1}:00`;
    slots.push({
      id: `${trainerId}-${date}-${startTime}`,
      date,
      start_time: startTime,
      end_time: endTime,
      is_available: Math.random() > 0.3, // 70% chance of being available
    });
  });
  
  return slots;
};

// Mock trainer availability
export const mockTrainerAvailability: TrainerAvailability[] = [
  {
    trainer_id: '2',
    trainer_name: 'Test Trainer',
    specialties: ['Strength Training', 'Weight Loss', 'Nutrition'],
    available_slots: [
      ...generateTimeSlots('2', 0), // Today
      ...generateTimeSlots('2', 1), // Tomorrow
      ...generateTimeSlots('2', 2), // Day after
      ...generateTimeSlots('2', 3), // 3 days
      ...generateTimeSlots('2', 4), // 4 days
      ...generateTimeSlots('2', 5), // 5 days
      ...generateTimeSlots('2', 6), // 6 days
    ],
  },
  {
    trainer_id: '7',
    trainer_name: 'Sarah Mitchell',
    specialties: ['Yoga', 'Pilates', 'Flexibility'],
    available_slots: [
      ...generateTimeSlots('7', 0),
      ...generateTimeSlots('7', 1),
      ...generateTimeSlots('7', 2),
      ...generateTimeSlots('7', 3),
      ...generateTimeSlots('7', 4),
      ...generateTimeSlots('7', 5),
      ...generateTimeSlots('7', 6),
    ],
  },
  {
    trainer_id: '8',
    trainer_name: 'Marcus Johnson',
    specialties: ['CrossFit', 'Athletic Training', 'Sports Performance'],
    available_slots: [
      ...generateTimeSlots('8', 0),
      ...generateTimeSlots('8', 1),
      ...generateTimeSlots('8', 2),
      ...generateTimeSlots('8', 3),
      ...generateTimeSlots('8', 4),
      ...generateTimeSlots('8', 5),
      ...generateTimeSlots('8', 6),
    ],
  },
];

// Helper functions for working with mock data
// TODO: Replace all with Supabase queries

// TODO: Replace with: supabase.from('sessions').select().eq('trainer_id', trainerId)
export const getSessionsByTrainer = (trainerId: string): Session[] => {
  return mockSessions.filter(session => session.trainer_id === trainerId);
};

// TODO: Replace with: supabase.from('sessions').select().eq('client_id', clientId)  
export const getSessionsByClient = (clientId: string): Session[] => {
  return mockSessions.filter(session => session.client_id === clientId);
};

// TODO: Replace with: supabase.from('sessions').select().eq('status', status)
export const getSessionsByStatus = (status: string): Session[] => {
  return mockSessions.filter(session => session.status === status);
};

// TODO: Replace with: supabase.from('trainers').select('*')
export const getTrainers = (): Trainer[] => {
  return mockTrainers;
};

// TODO: Replace with: supabase.from('trainer_availability').select().eq('trainer_id', trainerId)
export const getTrainerAvailability = (trainerId: string): TimeSlot[] => {
  const trainer = mockTrainerAvailability.find(t => t.trainer_id === trainerId);
  return trainer ? trainer.available_slots : [];
};

// TODO: Replace with: supabase.from('trainers').select('*, trainer_availability(*)')
export const getAllTrainers = (): TrainerAvailability[] => {
  return mockTrainerAvailability;
};

// Mock function to simulate session creation
// TODO: Replace with Supabase insert
// const { data, error } = await supabase.from('sessions').insert(sessionData)
export const createSession = (sessionData: any): Session => {
  const newSession: Session = {
    id: `mock-${Date.now()}`,
    trainer_id: sessionData.trainer_id,
    client_id: sessionData.client_id,
    scheduled_at: sessionData.scheduled_at,
    status: 'pending',
    notes: sessionData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trainer_name: sessionData.trainer_name,
    client_name: sessionData.client_name,
    duration_minutes: sessionData.duration_minutes || 60,
    session_type: sessionData.session_type || 'Personal Training',
  };
  
  // TODO: Replace with Supabase real-time
  // When REALTIME_ENABLED: Broadcast session creation to trainer
  // supabase.channel('sessions').send({ type: 'session_created', payload: newSession })
  mockSessions.push(newSession);
  return newSession;
};

// Mock function to update session status  
// TODO: Replace with Supabase update
// const { data, error } = await supabase.from('sessions').update({ status }).eq('id', sessionId)
export const updateSessionStatus = (sessionId: string, status: string): Session | null => {
  const sessionIndex = mockSessions.findIndex(session => session.id === sessionId);
  if (sessionIndex !== -1) {
    mockSessions[sessionIndex].status = status as any;
    mockSessions[sessionIndex].updated_at = new Date().toISOString();
    
    // TODO: Replace with Supabase real-time
    // When REALTIME_ENABLED: Broadcast status change to client/trainer
    // supabase.channel('sessions').send({ type: 'status_changed', payload: mockSessions[sessionIndex] })
    
    return mockSessions[sessionIndex];
  }
  return null;
};