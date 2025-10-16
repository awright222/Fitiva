/**
 * Client Program View Screen
 * Enhanced client experience for viewing and completing assigned programs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';

// Mock types for enhanced client experience
interface EnhancedExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty_level: string;
  equipment_needed: string[];
  duration_minutes: number;
  thumbnail_url?: string;
  video_url?: string;
  instructions: string;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
}

interface EnhancedProgramDay {
  id: string;
  program_id: string;
  name: string;
  description: string;
  day_number: number;
  exercises: EnhancedExercise[];
}

interface EnhancedProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_weeks: number;
  is_active: boolean;
  created_at: string;
  trainer: {
    id: string;
    name: string;
    email: string;
  };
  days: EnhancedProgramDay[];
}

interface ClientProgram {
  id: string;
  client_id: string;
  program: EnhancedProgram;
  assigned_date: string;
  status: 'active' | 'completed' | 'paused';
}

interface ExerciseLog {
  id: string;
  exercise_id: string;
  completed_at: string;
  completed_sets?: number;
  completed_reps?: number;
  completed_duration?: number;
  notes?: string;
}

export const ClientProgramViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ClientProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<EnhancedProgram | null>(null);
  const [selectedDay, setSelectedDay] = useState<EnhancedProgramDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingExercise, setCompletingExercise] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<{ [key: string]: ExerciseLog[] }>({});

  useFocusEffect(
    React.useCallback(() => {
      loadClientPrograms();
    }, [])
  );

  const loadClientPrograms = async () => {
    try {
      setLoading(true);
      
      // Enhanced mock data for client experience
      const mockPrograms: ClientProgram[] = [
        {
          id: '1',
          client_id: user?.id || 'client_1',
          program: {
            id: 'program_1',
            name: 'Beginner Strength Program',
            description: 'A gentle introduction to strength training designed specifically for seniors. Focus on building foundational strength and improving daily functional movements.',
            category: 'Strength Training',
            difficulty_level: 'Beginner',
            duration_weeks: 4,
            is_active: true,
            created_at: '2024-01-15T10:00:00Z',
            trainer: {
              id: 'trainer_1',
              name: 'Sarah Johnson',
              email: 'sarah@fitiva.com',
            },
            days: [
              {
                id: 'day_1',
                program_id: 'program_1',
                name: 'Upper Body Focus',
                description: 'Gentle exercises for arms, shoulders, and back. Perfect for building upper body strength.',
                day_number: 1,
                exercises: [
                  {
                    id: 'exercise_1',
                    name: 'Seated Row',
                    description: 'Strengthens back and arm muscles while seated comfortably',
                    category: 'Strength',
                    muscle_groups: ['Back', 'Arms'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Resistance Band'],
                    duration_minutes: 5,
                    thumbnail_url: 'https://example.com/thumbnails/seated-row.jpg',
                    instructions: 'Sit tall in your chair. Pull the resistance band towards your chest while squeezing your shoulder blades together. Hold for 2 seconds, then slowly return to starting position.',
                    sets: 2,
                    reps: 10,
                    rest_seconds: 60,
                    notes: 'Start with light resistance. Focus on proper form over speed.',
                  },
                  {
                    id: 'exercise_2',
                    name: 'Wall Push-ups',
                    description: 'Modified push-ups using a wall for support',
                    category: 'Strength',
                    muscle_groups: ['Chest', 'Arms', 'Shoulders'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 3,
                    thumbnail_url: 'https://example.com/thumbnails/wall-pushups.jpg',
                    instructions: 'Stand arm\'s length from a wall. Place palms flat against the wall at shoulder height. Push your body away from the wall, then return to starting position.',
                    sets: 2,
                    reps: 8,
                    rest_seconds: 60,
                    notes: 'Keep your body straight throughout the movement. If too easy, step further from the wall.',
                  },
                  {
                    id: 'exercise_3',
                    name: 'Arm Circles',
                    description: 'Gentle shoulder mobility and warm-up exercise',
                    category: 'Mobility',
                    muscle_groups: ['Shoulders'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 2,
                    thumbnail_url: 'https://example.com/thumbnails/arm-circles.jpg',
                    instructions: 'Extend arms out to the sides. Make small circles, gradually increasing the size. Reverse direction halfway through.',
                    sets: 1,
                    reps: 10,
                    rest_seconds: 30,
                    notes: 'Keep movements controlled and pain-free.',
                  },
                ],
              },
              {
                id: 'day_2',
                program_id: 'program_1',
                name: 'Lower Body & Balance',
                description: 'Leg strength and balance exercises to improve stability and daily mobility.',
                day_number: 2,
                exercises: [
                  {
                    id: 'exercise_4',
                    name: 'Chair Squats',
                    description: 'Sit-to-stand exercises using a chair for support',
                    category: 'Strength',
                    muscle_groups: ['Legs', 'Glutes', 'Core'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 4,
                    thumbnail_url: 'https://example.com/thumbnails/chair-squats.jpg',
                    instructions: 'Sit on the edge of a sturdy chair. Stand up without using your hands, then sit back down slowly and controlled.',
                    sets: 2,
                    reps: 12,
                    rest_seconds: 60,
                    notes: 'Use chair arms for balance if needed. Focus on controlled movement.',
                  },
                  {
                    id: 'exercise_5',
                    name: 'Calf Raises',
                    description: 'Strengthen calf muscles and improve balance',
                    category: 'Strength',
                    muscle_groups: ['Calves'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 3,
                    thumbnail_url: 'https://example.com/thumbnails/calf-raises.jpg',
                    instructions: 'Hold onto a chair for balance. Rise up on your toes as high as possible, hold for 2 seconds, then lower slowly.',
                    sets: 2,
                    reps: 15,
                    rest_seconds: 45,
                    notes: 'Hold the top position for 2 seconds for extra challenge.',
                  },
                ],
              },
              {
                id: 'day_3',
                program_id: 'program_1',
                name: 'Flexibility & Recovery',
                description: 'Gentle stretching and mobility exercises to improve range of motion.',
                day_number: 3,
                exercises: [
                  {
                    id: 'exercise_6',
                    name: 'Shoulder Rolls',
                    description: 'Gentle shoulder mobility exercise',
                    category: 'Flexibility',
                    muscle_groups: ['Shoulders', 'Upper Back'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 2,
                    thumbnail_url: 'https://example.com/thumbnails/shoulder-rolls.jpg',
                    instructions: 'Roll shoulders forward, up, back, and down in smooth circles. Focus on the full range of motion.',
                    sets: 1,
                    reps: 10,
                    rest_seconds: 0,
                    notes: 'Breathe deeply throughout the movement.',
                  },
                  {
                    id: 'exercise_7',
                    name: 'Neck Stretches',
                    description: 'Gentle neck and upper shoulder stretches',
                    category: 'Flexibility',
                    muscle_groups: ['Neck', 'Upper Shoulders'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 3,
                    thumbnail_url: 'https://example.com/thumbnails/neck-stretches.jpg',
                    instructions: 'Gently tilt your head to each side, holding for 15 seconds. Then look up and down slowly.',
                    duration_seconds: 30,
                    notes: 'Never force the stretch. Stop if you feel any pain.',
                  },
                ],
              },
            ],
          },
          assigned_date: '2024-01-15T10:00:00Z',
          status: 'active',
        },
        {
          id: '2',
          client_id: user?.id || 'client_1',
          program: {
            id: 'program_2',
            name: 'Balance & Coordination',
            description: 'Improve balance, coordination, and prevent falls with these targeted exercises.',
            category: 'Balance',
            difficulty_level: 'Beginner',
            duration_weeks: 3,
            is_active: true,
            created_at: '2024-01-20T10:00:00Z',
            trainer: {
              id: 'trainer_1',
              name: 'Sarah Johnson',
              email: 'sarah@fitiva.com',
            },
            days: [
              {
                id: 'day_4',
                program_id: 'program_2',
                name: 'Standing Balance',
                description: 'Improve standing balance and stability.',
                day_number: 1,
                exercises: [
                  {
                    id: 'exercise_8',
                    name: 'Single Leg Stand',
                    description: 'Hold balance on one foot to improve stability',
                    category: 'Balance',
                    muscle_groups: ['Legs', 'Core'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 2,
                    thumbnail_url: 'https://example.com/thumbnails/single-leg-stand.jpg',
                    instructions: 'Hold onto a chair with one hand. Lift one foot slightly off the ground and hold for 10 seconds. Switch legs.',
                    sets: 2,
                    reps: 5,
                    rest_seconds: 30,
                    notes: 'Start with both hands on chair, progress to one hand, then no hands when ready.',
                  },
                ],
              },
            ],
          },
          assigned_date: '2024-01-20T10:00:00Z',
          status: 'active',
        },
      ];

      setPrograms(mockPrograms);

      // Mock exercise logs
      setExerciseLogs({
        'exercise_1': [
          {
            id: 'log_1',
            exercise_id: 'exercise_1',
            completed_at: '2024-01-16T09:00:00Z',
            completed_sets: 2,
            completed_reps: 10,
            notes: 'Felt good, slight fatigue in arms',
          },
          {
            id: 'log_2',
            exercise_id: 'exercise_1',
            completed_at: '2024-01-18T10:30:00Z',
            completed_sets: 2,
            completed_reps: 12,
            notes: 'Increased reps, feeling stronger',
          },
        ],
        'exercise_4': [
          {
            id: 'log_3',
            exercise_id: 'exercise_4',
            completed_at: '2024-01-17T08:00:00Z',
            completed_sets: 2,
            completed_reps: 12,
            notes: 'Good form, no knee pain',
          },
        ],
      });

    } catch (error) {
      console.error('Error loading client programs:', error);
      Alert.alert('Error', 'Could not load your programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExercise = async (exercise: EnhancedExercise) => {
    Alert.alert(
      'Complete Exercise',
      `Mark "${exercise.name}" as completed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: () => logExercise(exercise),
        },
      ],
    );
  };

  const logExercise = async (exercise: EnhancedExercise) => {
    try {
      setCompletingExercise(exercise.id);

      // Simulate logging delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to local logs
      const newLog: ExerciseLog = {
        id: `log_${Date.now()}`,
        exercise_id: exercise.id,
        completed_at: new Date().toISOString(),
        completed_sets: exercise.sets,
        completed_reps: exercise.reps,
        completed_duration: exercise.duration_seconds,
        notes: 'Completed via mobile app',
      };

      setExerciseLogs(prev => ({
        ...prev,
        [exercise.id]: [...(prev[exercise.id] || []), newLog],
      }));

      Alert.alert('Success', 'Exercise completed! Great work! 🎉');
    } catch (error) {
      console.error('Error logging exercise:', error);
      Alert.alert('Error', 'Could not log exercise completion. Please try again.');
    } finally {
      setCompletingExercise(null);
    }
  };

  const isExerciseCompletedToday = (exerciseId: string): boolean => {
    const logs = exerciseLogs[exerciseId];
    if (!logs || logs.length === 0) return false;

    const today = new Date().toISOString().split('T')[0];
    return logs.some(log => log.completed_at.startsWith(today));
  };

  const getExerciseCompletionCount = (exerciseId: string): number => {
    const logs = exerciseLogs[exerciseId];
    return logs ? logs.length : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your programs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Program List View
  if (!selectedProgram) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Programs</Text>
          <Text style={styles.subtitle}>Your assigned workout programs</Text>
        </View>

        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Programs Assigned</Text>
            <Text style={styles.emptyText}>
              Your trainer hasn't assigned any programs yet.{'\n'}Check back soon!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.programList}>
            {programs.map((clientProgram) => (
              <TouchableOpacity
                key={clientProgram.id}
                style={styles.programCard}
                onPress={() => setSelectedProgram(clientProgram.program)}
              >
                <View style={styles.programHeader}>
                  <Text style={styles.programName}>{clientProgram.program.name}</Text>
                  <View style={styles.programBadge}>
                    <Text style={styles.programBadgeText}>{clientProgram.program.difficulty_level}</Text>
                  </View>
                </View>
                <Text style={styles.programDescription}>{clientProgram.program.description}</Text>
                <View style={styles.programMeta}>
                  <Text style={styles.programMetaText}>
                    <Ionicons name="person-outline" size={14} color="#666" /> {clientProgram.program.trainer.name}
                  </Text>
                  <Text style={styles.programMetaText}>
                    <Ionicons name="time-outline" size={14} color="#666" /> {clientProgram.program.duration_weeks} weeks
                  </Text>
                </View>
                <View style={styles.programStats}>
                  <Text style={styles.programStatsText}>
                    {clientProgram.program.days.length} workout days • {clientProgram.program.category}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Program Detail View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedProgram(null)}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{selectedProgram.name}</Text>
          <Text style={styles.subtitle}>by {selectedProgram.trainer.name}</Text>
        </View>
      </View>

      {/* Day Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {selectedProgram.days.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              selectedDay?.id === day.id && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay?.id === day.id && styles.dayButtonTextActive,
              ]}
            >
              Day {day.day_number}
            </Text>
            <Text
              style={[
                styles.dayButtonName,
                selectedDay?.id === day.id && styles.dayButtonNameActive,
              ]}
            >
              {day.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList}>
        {selectedDay ? (
          <>
            <View style={styles.dayInfo}>
              <Text style={styles.dayTitle}>Day {selectedDay.day_number}: {selectedDay.name}</Text>
              <Text style={styles.dayDescription}>{selectedDay.description}</Text>
            </View>

            {selectedDay.exercises.map((exercise) => {
              const isCompleted = isExerciseCompletedToday(exercise.id);
              const completionCount = getExerciseCompletionCount(exercise.id);

              return (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        isCompleted && styles.completeButtonCompleted,
                        completingExercise === exercise.id && styles.completeButtonLoading,
                      ]}
                      onPress={() => handleCompleteExercise(exercise)}
                      disabled={completingExercise === exercise.id}
                    >
                      {completingExercise === exercise.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : isCompleted ? (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      ) : (
                        <Ionicons name="add" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.exerciseDetails}>
                    {exercise.sets && exercise.reps && (
                      <View style={styles.exerciseDetail}>
                        <Ionicons name="repeat-outline" size={16} color="#666" />
                        <Text style={styles.exerciseDetailText}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                      </View>
                    )}
                    {exercise.duration_seconds && (
                      <View style={styles.exerciseDetail}>
                        <Ionicons name="timer-outline" size={16} color="#666" />
                        <Text style={styles.exerciseDetailText}>
                          {Math.floor(exercise.duration_seconds / 60)}:
                          {(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                        </Text>
                      </View>
                    )}
                    {exercise.rest_seconds && (
                      <View style={styles.exerciseDetail}>
                        <Ionicons name="pause-outline" size={16} color="#666" />
                        <Text style={styles.exerciseDetailText}>
                          Rest {exercise.rest_seconds}s
                        </Text>
                      </View>
                    )}
                    {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                      <View style={styles.exerciseDetail}>
                        <Ionicons name="barbell-outline" size={16} color="#666" />
                        <Text style={styles.exerciseDetailText}>
                          {exercise.equipment_needed.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {exercise.instructions && (
                    <View style={styles.exerciseInstructions}>
                      <Text style={styles.exerciseInstructionsTitle}>Instructions:</Text>
                      <Text style={styles.exerciseInstructionsText}>{exercise.instructions}</Text>
                    </View>
                  )}

                  {exercise.notes && (
                    <View style={styles.exerciseNotes}>
                      <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
                      <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
                    </View>
                  )}

                  {completionCount > 0 && (
                    <View style={styles.completionStats}>
                      <Text style={styles.completionStatsText}>
                        Completed {completionCount} time{completionCount === 1 ? '' : 's'}
                      </Text>
                      {isCompleted && (
                        <Text style={styles.completionToday}>✓ Completed today</Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.selectDayPrompt}>
            <Text style={styles.selectDayText}>Select a day to see exercises</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  programList: {
    padding: 20,
  },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    lineHeight: 26,
  },
  programBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  programBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  programDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  programMetaText: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  programStats: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  programStatsText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  daySelector: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  daySelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dayButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    minWidth: 90,
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  dayButtonName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  dayButtonNameActive: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
    padding: 20,
  },
  dayInfo: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  selectDayPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  selectDayText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 24,
  },
  exerciseDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 21,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  completeButtonLoading: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  exerciseDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  exerciseInstructions: {
    backgroundColor: '#f0f8ff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseInstructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  exerciseInstructionsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseNotesText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  completionStats: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  completionStatsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  completionToday: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default ClientProgramViewScreen;