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
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { SectionHeader, Button, DashboardCard } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES } from '../../../config/features';
import type { ClientProgram, Program, ProgramDay } from '../types';
import { getClientPrograms } from '../data/mockData';

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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