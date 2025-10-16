/**
 * Client Program View Screen
 * 
 * Screen for clients to view their assigned workout programs.
 * Features:
 * - View program details and progress
 * - See exercise thumbnails and videos
 * - Track completed workouts
 * - Large, accessible design for seniors
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Load Client Programs:
 *    - Query: supabase.from('client_programs').select('*, program:programs(*)')
 *    - Filter by client_id and is_active
 * 
 * 2. Exercise Details:
 *    - Load exercise data with thumbnails/videos from content_library
 *    - Progressive loading for video content
 * 
 * 3. Progress Tracking:
 *    - Insert completed workouts into workout_sessions table
 *    - Track exercise completion and notes
 * 
 * 4. Real-time Updates:
 *    - Subscribe to program assignment changes
 *    - Notify when new programs are assigned
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { SectionHeader, Button, DashboardCard } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES } from '../../../config/features';
import type { ClientProgram, Program, ProgramDay } from '../types';
import { getClientPrograms } from '../../../services/content-library';

type ClientProgramViewScreenProps = {
  navigation: StackNavigationProp<any>;
  route?: {
    params?: {
      programId?: string;
    };
  };
};

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export const ClientProgramViewScreen: React.FC<ClientProgramViewScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ClientProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingExercise, setCompletingExercise] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    loadClientPrograms();
  }, []);

  useEffect(() => {
    // If programId is provided in route params, select that program
    if (route?.params?.programId && programs.length > 0) {
      const program = programs.find(p => p.program?.id === route.params.programId)?.program;
      if (program) {
        setSelectedProgram(program);
        if (program.days && program.days.length > 0) {
          setSelectedDay(program.days[0]);
        }
      }
    }
  }, [route?.params?.programId, programs]);

  const loadClientPrograms = async () => {
    try {
      setLoading(true);
      
      // Mock client programs with enhanced data
      const mockPrograms: ClientProgram[] = [
        {
          id: '1',
          client_id: user?.id || 'client_1',
          program: {
            id: 'program_1',
            name: 'Beginner Strength Program',
            description: 'A gentle introduction to strength training designed for seniors. Focus on building foundational strength and improving daily functional movements.',
            trainer: {
              id: 'trainer_1',
              name: 'Sarah Johnson',
              email: 'sarah@fitiva.com',
            },
            category: 'Strength Training',
            difficulty_level: 'Beginner',
            duration_weeks: 4,
            is_active: true,
            created_at: '2024-01-15T10:00:00Z',
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
                    instructions: 'Sit tall, pull band towards your chest, squeeze shoulder blades together',
                    sets: 2,
                    reps: 10,
                    rest_seconds: 60,
                    notes: 'Start with light resistance. Focus on proper form.',
                  },
                  {
                    id: 'exercise_2',
                    name: 'Wall Push-ups',
                    description: 'Modified push-ups using a wall for support',
                    category: 'Strength',
                    muscle_groups: ['Chest', 'Arms'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 3,
                    thumbnail_url: 'https://example.com/thumbnails/wall-pushups.jpg',
                    instructions: 'Stand arm\'s length from wall, place palms flat, push away from wall',
                    sets: 2,
                    reps: 8,
                    rest_seconds: 60,
                    notes: 'Keep body straight. If too easy, step further from wall.',
                  },
                ],
              },
              {
                id: 'day_2',
                program_id: 'program_1',
                name: 'Lower Body & Balance',
                description: 'Leg strength and balance exercises to improve stability and mobility.',
                day_number: 2,
                exercises: [
                  {
                    id: 'exercise_3',
                    name: 'Chair Squats',
                    description: 'Sit-to-stand exercises using a chair for support',
                    category: 'Strength',
                    muscle_groups: ['Legs', 'Glutes'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 4,
                    thumbnail_url: 'https://example.com/thumbnails/chair-squats.jpg',
                    instructions: 'Sit on edge of chair, stand up without using hands, sit back down slowly',
                    sets: 2,
                    reps: 12,
                    rest_seconds: 60,
                    notes: 'Use chair arms for balance if needed. Focus on controlled movement.',
                  },
                  {
                    id: 'exercise_4',
                    name: 'Calf Raises',
                    description: 'Strengthen calf muscles and improve balance',
                    category: 'Strength',
                    muscle_groups: ['Calves'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 3,
                    thumbnail_url: 'https://example.com/thumbnails/calf-raises.jpg',
                    instructions: 'Hold chair for balance, rise up on toes, lower slowly',
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
                name: 'Flexibility & Mobility',
                description: 'Gentle stretching and mobility exercises to improve range of motion.',
                day_number: 3,
                exercises: [
                  {
                    id: 'exercise_5',
                    name: 'Shoulder Rolls',
                    description: 'Gentle shoulder mobility exercise',
                    category: 'Flexibility',
                    muscle_groups: ['Shoulders'],
                    difficulty_level: 'Beginner',
                    equipment_needed: [],
                    duration_minutes: 2,
                    thumbnail_url: 'https://example.com/thumbnails/shoulder-rolls.jpg',
                    instructions: 'Roll shoulders forward, up, back, and down in smooth circles',
                    sets: 1,
                    reps: 10,
                    rest_seconds: 0,
                    notes: 'Breathe deeply throughout the movement.',
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
            trainer: {
              id: 'trainer_1',
              name: 'Sarah Johnson',
              email: 'sarah@fitiva.com',
            },
            category: 'Balance',
            difficulty_level: 'Beginner',
            duration_weeks: 3,
            is_active: true,
            created_at: '2024-01-20T10:00:00Z',
            days: [
              {
                id: 'day_4',
                program_id: 'program_2',
                name: 'Standing Balance',
                description: 'Improve standing balance and stability.',
                day_number: 1,
                exercises: [
                  {
                    id: 'exercise_6',
                    name: 'Single Leg Stand',
                    description: 'Hold balance on one foot to improve stability',
                    category: 'Balance',
                    muscle_groups: ['Legs', 'Core'],
                    difficulty_level: 'Beginner',
                    equipment_needed: ['Chair'],
                    duration_minutes: 2,
                    thumbnail_url: 'https://example.com/thumbnails/single-leg-stand.jpg',
                    instructions: 'Hold chair with one hand, lift one foot slightly off ground, hold for 10 seconds',
                    sets: 2,
                    reps: 5,
                    rest_seconds: 30,
                    notes: 'Start with both hands on chair, progress to one hand, then no hands.',
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
        'exercise_3': [
          {
            id: 'log_3',
            exercise_id: 'exercise_3',
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

  const handleCompleteExercise = async (exercise: any) => {
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

  const logExercise = async (exercise: any) => {
    try {
      setCompletingExercise(exercise.id);

      // Simulate logging delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to local logs
      const newLog = {
        id: `log_${Date.now()}`,
        exercise_id: exercise.id,
        completed_at: new Date().toISOString(),
        completed_sets: exercise.sets,
        completed_reps: exercise.reps,
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
          <Text style={[typography.h2, { color: colors.gray[600], textAlign: 'center' }]}>
            Loading your programs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Program List View
  if (!selectedProgram) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SectionHeader 
            title="My Programs" 
            subtitle="Your assigned workout programs"
          />
        </View>

        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={80} color={colors.gray[200]} />
            <Text style={[typography.h3, { color: colors.gray[600], textAlign: 'center', marginTop: 16 }]}>
              No Programs Assigned
            </Text>
            <Text style={[typography.body, { color: colors.gray[600], textAlign: 'center', marginTop: 8 }]}>
              Your trainer hasn't assigned any programs yet.{'\n'}Check back soon!
            </Text>
          </View>
        ) : (
          <FlatList
            data={programs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.programList}
            renderItem={({ item }) => (
              <DashboardCard
                title={item.program?.name || 'Program'}
                subtitle={`${item.program?.difficulty_level} • ${item.program?.duration_weeks} weeks`}
                description={item.program?.description}
                onPress={() => setSelectedProgram(item.program!)}
                style={styles.programCard}
              />
            )}
          />
        )}
      </SafeAreaView>
    );
  }
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ClientProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<ClientProgram | null>(null);

  useEffect(() => {
    loadPrograms();
  }, [user?.id]);

  // Load client's assigned programs
  const loadPrograms = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with Supabase query
      const clientPrograms = await getClientPrograms(user?.id || '');
      setPrograms(clientPrograms);
      
      // If specific program ID provided, select it
      if (route?.params?.programId) {
        const program = clientPrograms.find(p => p.program_id === route.params?.programId);
        if (program) setSelectedProgram(program);
      }
      
    } catch (error) {
      console.error('Error loading programs:', error);
      Alert.alert(
        'Error',
        'Unable to load your workout programs. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProgramPress = (clientProgram: ClientProgram) => {
    setSelectedProgram(clientProgram);
  };

  const handleStartWorkout = (program: Program, day: ProgramDay) => {
    // TODO: Navigate to workout session screen
    Alert.alert(
      'Start Workout',
      `Ready to start "${day.title}"?\n\n${day.exercises?.length || 0} exercises\nEstimated time: ${day.estimated_duration || 30} minutes`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // TODO: navigation.navigate('WorkoutSession', { programId: program.id, dayId: day.id });
            console.log('Starting workout:', day.title);
          }
        }
      ]
    );
  };

  const renderProgramCard = ({ item }: { item: ClientProgram }) => (
    <DashboardCard
      title={item.program?.title || 'Workout Program'}
      subtitle={`${item.program?.duration_weeks} weeks • ${item.program?.difficulty}`}
      onPress={() => handleProgramPress(item)}
    >
      <View style={styles.programCardContent}>
        <Text style={styles.programDescription}>
          {item.program?.description}
        </Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {item.days_completed || 0} / {item.total_days || 0} days
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${item.completion_percentage || 0}%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </DashboardCard>
  );

  const renderDayCard = (day: ProgramDay, dayIndex: number) => (
    <View key={day.id} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayTitleContainer}>
          <Text style={styles.dayTitle}>{day.title}</Text>
          <View style={[styles.dayBadge, day.is_rest_day && styles.restDayBadge]}>
            <Text style={[styles.dayBadgeText, day.is_rest_day && styles.restDayBadgeText]}>
              {day.is_rest_day ? 'Rest Day' : `${day.exercises?.length || 0} exercises`}
            </Text>
          </View>
        </View>
        
        {day.description && (
          <Text style={styles.dayDescription}>{day.description}</Text>
        )}
      </View>

      {!day.is_rest_day && (
        <>
          {/* Exercise previews */}
          <View style={styles.exercisePreview}>
            {(day.exercises || []).slice(0, 3).map((programExercise, index) => (
              <View key={programExercise.id} style={styles.exercisePreviewItem}>
                {programExercise.exercise?.thumbnail_url && (
                  <Image 
                    source={{ uri: programExercise.exercise.thumbnail_url }}
                    style={styles.exerciseThumbnail}
                  />
                )}
                <View style={styles.exercisePreviewText}>
                  <Text style={styles.exercisePreviewTitle}>
                    {programExercise.exercise?.title}
                  </Text>
                  <Text style={styles.exercisePreviewDetails}>
                    {programExercise.sets} sets × {programExercise.reps}
                  </Text>
                </View>
              </View>
            ))}
            
            {(day.exercises || []).length > 3 && (
              <Text style={styles.moreExercisesText}>
                +{(day.exercises || []).length - 3} more exercises
              </Text>
            )}
          </View>

          <Button
            title="Start Workout"
            onPress={() => selectedProgram?.program && handleStartWorkout(selectedProgram.program, day)}
            style={styles.startWorkoutButton}
          />
        </>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="fitness" size={64} color={colors.gray[600]} />
      <Text style={styles.emptyStateTitle}>No Programs Assigned</Text>
      <Text style={styles.emptyStateDescription}>
        Your trainer hasn't assigned any workout programs yet. 
        Check back soon or contact your trainer for a personalized program!
      </Text>
    </View>
  );

  if (!FEATURES.CONTENT_LIBRARY_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledState}>
          <Ionicons name="construct" size={64} color={colors.gray[600]} />
          <Text style={styles.disabledTitle}>Programs Coming Soon</Text>
          <Text style={styles.disabledDescription}>
            The workout programs feature is currently under development.
            Check back soon for personalized training programs!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Program detail view
  if (selectedProgram) {
    return (
      <SafeAreaView style={styles.container}>
        <SectionHeader
          title={selectedProgram.program?.title || 'Program'}
          subtitle={`${selectedProgram.program?.difficulty} • ${selectedProgram.program?.duration_weeks} weeks`}
          actionText="Back"
          onActionPress={() => setSelectedProgram(null)}
        />

        <FlatList
          data={selectedProgram.program?.days || []}
          renderItem={({ item, index }) => renderDayCard(item, index)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.daysContent}
        />
      </SafeAreaView>
    );
  }

  // Program list view
  return (
    <SafeAreaView style={styles.container}>
      <SectionHeader
        title="My Programs"
        subtitle={`${programs.length} program${programs.length !== 1 ? 's' : ''} assigned`}
      />

      <FlatList
        data={programs}
        renderItem={renderProgramCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={loading ? null : renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  } as ViewStyle,

  listContent: {
    paddingVertical: 8,
  } as ViewStyle,

  daysContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,

  programCardContent: {
    paddingTop: 12,
  } as ViewStyle,

  programDescription: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: 16,
  } as TextStyle,

  progressContainer: {
    gap: 8,
  } as ViewStyle,

  progressText: {
    ...typography.caption,
    color: colors.gray[600],
  } as TextStyle,

  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  } as ViewStyle,

  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Cross-platform shadow/box-shadow
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }
    ),
  } as ViewStyle,

  dayHeader: {
    marginBottom: 16,
  } as ViewStyle,

  dayTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  dayTitle: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
  } as TextStyle,

  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.primary,
  } as ViewStyle,

  restDayBadge: {
    backgroundColor: colors.gray[200],
  } as ViewStyle,

  dayBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  restDayBadgeText: {
    color: colors.gray[600],
  } as TextStyle,

  dayDescription: {
    ...typography.body,
    color: colors.gray[600],
  } as TextStyle,

  exercisePreview: {
    marginBottom: 16,
    gap: 8,
  } as ViewStyle,

  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.gray[200],
  },

  exercisePreviewText: {
    flex: 1,
  } as ViewStyle,

  exercisePreviewTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[900],
  } as TextStyle,

  exercisePreviewDetails: {
    ...typography.caption,
    color: colors.gray[600],
  } as TextStyle,

  moreExercisesText: {
    ...typography.caption,
    color: colors.gray[600],
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  } as TextStyle,

  startWorkoutButton: {
    backgroundColor: colors.success,
  } as ViewStyle,

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  } as ViewStyle,

  emptyStateTitle: {
    ...typography.h2,
    color: colors.gray[900],
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  emptyStateDescription: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
  } as TextStyle,

  disabledState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,

  disabledTitle: {
    ...typography.h2,
    color: colors.gray[900],
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  disabledDescription: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
  } as TextStyle,
});