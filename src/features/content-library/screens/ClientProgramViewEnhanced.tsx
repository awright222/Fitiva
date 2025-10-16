/**
 * Enhanced Client Program View Screen
 * 
 * Screen for clients to view their assigned workout programs with:
 * - Exercise thumbnails and videos
 * - Completion tracking
 * - Video playback
 * - Exercise details and instructions
 * - Large, accessible design for seniors
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';

import { SectionHeader, Button } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES } from '../../../config/features';
import type { Program, ProgramDay, ProgramExercise, Exercise } from '../../../types';
import { 
  getPrograms, 
  getFilePublicUrl,
  // TODO: Implement client-specific program fetching
  // getClientPrograms,
  // markExerciseComplete,
  // markDayComplete
} from '../../../services/content-library';

type ClientProgramViewScreenProps = {
  navigation: StackNavigationProp<any>;
  route?: {
    params?: {
      programId?: string;
    };
  };
};

interface ExerciseCompletion {
  exerciseId: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

interface DayCompletion {
  dayId: number;
  completed: boolean;
  completedAt?: string;
  exercises: ExerciseCompletion[];
}

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
  },
} as const;

// Typography optimized for seniors
const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
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
  bodyLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export const ClientProgramViewEnhanced: React.FC<ClientProgramViewScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  
  // Completion tracking state (TODO: Load from backend)
  const [completions, setCompletions] = useState<DayCompletion[]>([]);

  // Load programs when component mounts
  useEffect(() => {
    loadPrograms();
  }, [user?.id]);

  // Focus listener to refresh data
  useFocusEffect(
    useCallback(() => {
      console.log('ClientProgramViewEnhanced focused - reloading data');
      loadPrograms();
    }, [])
  );

  const loadPrograms = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('Loading client programs...');
      
      // TODO: Replace with actual client program fetching
      // For now, get all programs and filter by client_id
      const { programs: data } = await getPrograms({ client_id: user.id });
      setPrograms(data);
      
      // Auto-select first program if specified in route or only one exists
      if (route?.params?.programId) {
        const program = data.find(p => p.id.toString() === route.params!.programId);
        setSelectedProgram(program || null);
      } else if (data.length === 1) {
        setSelectedProgram(data[0]);
      }
      
      console.log(`Loaded ${data.length} client programs`);
    } catch (error) {
      console.error('Error loading client programs:', error);
      Alert.alert('Error', 'Failed to load your programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const handleExerciseComplete = async (exerciseId: number, dayId: number) => {
    // TODO: Implement backend completion tracking
    console.log(`Marking exercise ${exerciseId} complete for day ${dayId}`);
    
    // Update local state for now
    setCompletions(prev => {
      const dayCompletion = prev.find(d => d.dayId === dayId) || {
        dayId,
        completed: false,
        exercises: [],
      };
      
      const exerciseIndex = dayCompletion.exercises.findIndex(e => e.exerciseId === exerciseId);
      if (exerciseIndex >= 0) {
        dayCompletion.exercises[exerciseIndex] = {
          exerciseId,
          completed: true,
          completedAt: new Date().toISOString(),
        };
      } else {
        dayCompletion.exercises.push({
          exerciseId,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
      
      // Check if all exercises in day are complete
      const allDayExercises = selectedProgram?.program_days?.find(d => d.id === dayId)?.program_exercises || [];
      const completedExercises = dayCompletion.exercises.filter(e => e.completed);
      dayCompletion.completed = completedExercises.length === allDayExercises.length;
      
      return [...prev.filter(d => d.dayId !== dayId), dayCompletion];
    });
    
    Alert.alert('Great Job!', 'Exercise marked as complete. Keep up the great work!');
  };

  const isExerciseComplete = (exerciseId: number, dayId: number): boolean => {
    const dayCompletion = completions.find(d => d.dayId === dayId);
    return dayCompletion?.exercises.find(e => e.exerciseId === exerciseId)?.completed || false;
  };

  const isDayComplete = (dayId: number): boolean => {
    const dayCompletion = completions.find(d => d.dayId === dayId);
    return dayCompletion?.completed || false;
  };

  const renderProgramList = () => (
    <View style={styles.programList}>
      <SectionHeader title="My Programs" />
      {programs.map((program) => (
        <TouchableOpacity
          key={program.id}
          style={[
            styles.programCard,
            selectedProgram?.id === program.id && styles.selectedProgramCard,
          ]}
          onPress={() => setSelectedProgram(program)}
        >
          <View style={styles.programCardHeader}>
            <Text style={styles.programTitle}>{program.title}</Text>
            {selectedProgram?.id === program.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </View>
          <Text style={styles.programDescription} numberOfLines={2}>
            {program.description}
          </Text>
          <View style={styles.programStats}>
            <Text style={styles.programStat}>
              {program.program_days?.length || 0} days
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderExerciseCard = (exercise: ProgramExercise, dayId: number) => {
    const isCompleted = isExerciseComplete(exercise.id, dayId);
    
    return (
      <View key={exercise.id} style={styles.exerciseCard}>
        {/* Exercise Thumbnail */}
        {exercise.exercise?.thumbnail_url && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: getFilePublicUrl('exercise-thumbnails', exercise.exercise.thumbnail_url) }}
              style={styles.exerciseThumbnail}
              resizeMode="cover"
            />
            {exercise.exercise?.video_url && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => setPlayingVideo(playingVideo === exercise.id ? null : exercise.id)}
              >
                <Ionicons
                  name={playingVideo === exercise.id ? "pause" : "play"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Exercise Details */}
        <View style={styles.exerciseDetails}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>
              {exercise.exercise?.title || 'Exercise'}
            </Text>
            <TouchableOpacity
              style={[
                styles.completeButton,
                isCompleted && styles.completeButtonCompleted,
              ]}
              onPress={() => handleExerciseComplete(exercise.id, dayId)}
              disabled={isCompleted}
            >
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={isCompleted ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.completeButtonText,
                  isCompleted && styles.completeButtonTextCompleted,
                ]}
              >
                {isCompleted ? 'Complete' : 'Mark Done'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Exercise Parameters */}
          <View style={styles.exerciseParams}>
            {exercise.sets && (
              <Text style={styles.exerciseParam}>Sets: {exercise.sets}</Text>
            )}
            {exercise.reps && (
              <Text style={styles.exerciseParam}>Reps: {exercise.reps}</Text>
            )}
            {exercise.rest_seconds && (
              <Text style={styles.exerciseParam}>Rest: {exercise.rest_seconds}s</Text>
            )}
          </View>

          {/* Exercise Description */}
          {exercise.exercise?.description && (
            <Text style={styles.exerciseDescription}>
              {exercise.exercise.description}
            </Text>
          )}

          {/* Exercise Notes */}
          {exercise.notes && (
            <Text style={styles.exerciseNotes}>
              Notes: {exercise.notes}
            </Text>
          )}
        </View>

        {/* Video Player */}
        {playingVideo === exercise.id && exercise.exercise?.video_url && (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: getFilePublicUrl('exercise-videos', exercise.exercise.video_url) }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status) => {
                if ('didJustFinish' in status && status.didJustFinish) {
                  setPlayingVideo(null);
                }
              }}
            />
          </View>
        )}
      </View>
    );
  };

  const renderProgramDay = (day: ProgramDay) => {
    const isCompleted = isDayComplete(day.id);
    
    return (
      <View key={day.id} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>Day {day.day_number}</Text>
          {isCompleted && (
            <View style={styles.dayCompleteBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.dayCompleteText}>Complete</Text>
            </View>
          )}
        </View>
        
        {/* Remove day notes since they don't exist in the ProgramDay type */}

        {/* Exercises */}
        <View style={styles.exercisesList}>
          {day.program_exercises?.map(exercise => 
            renderExerciseCard(exercise, day.id)
          )}
        </View>
      </View>
    );
  };

  const renderProgramDetails = () => (
    <ScrollView 
      style={styles.programDetails}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.programHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedProgram(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Back to Programs</Text>
        </TouchableOpacity>
        
        <Text style={styles.selectedProgramTitle}>{selectedProgram?.title}</Text>
        {selectedProgram?.description && (
          <Text style={styles.selectedProgramDescription}>
            {selectedProgram.description}
          </Text>
        )}
      </View>

      {/* Program Days */}
      {selectedProgram?.program_days?.map(renderProgramDay)}
    </ScrollView>
  );

  if (!FEATURES.CLIENT_PROGRAM_VIEW_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledState}>
          <Ionicons name="construct" size={64} color={colors.gray[400]} />
          <Text style={styles.disabledTitle}>Program View Disabled</Text>
          <Text style={styles.disabledSubtitle}>
            This feature is currently disabled. Contact your trainer for access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your programs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (programs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyStateTitle}>No Programs Assigned</Text>
          <Text style={styles.emptyStateSubtitle}>
            Your trainer hasn't assigned any programs yet. Contact them to get started!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedProgram ? renderProgramDetails() : renderProgramList()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  } as ViewStyle,

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  loadingText: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  } as ViewStyle,

  emptyStateTitle: {
    ...typography.h2,
    color: colors.gray[900],
    marginTop: 24,
    textAlign: 'center',
  } as TextStyle,

  emptyStateSubtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,

  disabledState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  } as ViewStyle,

  disabledTitle: {
    ...typography.h2,
    color: colors.gray[900],
    marginTop: 24,
    textAlign: 'center',
  } as TextStyle,

  disabledSubtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,

  programList: {
    flex: 1,
    padding: 20,
  } as ViewStyle,

  programCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.gray[200],
  } as ViewStyle,

  selectedProgramCard: {
    borderColor: colors.primary,
    backgroundColor: colors.blue[50],
  } as ViewStyle,

  programCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  programTitle: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
  } as TextStyle,

  programDescription: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: 12,
  } as TextStyle,

  programStats: {
    flexDirection: 'row',
  } as ViewStyle,

  programStat: {
    ...typography.caption,
    color: colors.gray[600],
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  } as TextStyle,

  programDetails: {
    flex: 1,
  } as ViewStyle,

  programHeader: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  backButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  } as TextStyle,

  selectedProgramTitle: {
    ...typography.h1,
    color: colors.gray[900],
    marginBottom: 8,
  } as TextStyle,

  selectedProgramDescription: {
    ...typography.body,
    color: colors.gray[600],
  } as TextStyle,

  dayCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  } as ViewStyle,

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  dayTitle: {
    ...typography.h2,
    color: colors.gray[900],
  } as TextStyle,

  dayCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  } as ViewStyle,

  dayCompleteText: {
    ...typography.caption,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '600',
  } as TextStyle,

  dayNotes: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: 16,
    fontStyle: 'italic',
  } as TextStyle,

  exercisesList: {
    gap: 16,
  } as ViewStyle,

  exerciseCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  thumbnailContainer: {
    position: 'relative',
    marginBottom: 12,
  } as ViewStyle,

  exerciseThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },

  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  exerciseDetails: {
    gap: 8,
  } as ViewStyle,

  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  exerciseName: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
  } as TextStyle,

  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  } as ViewStyle,

  completeButtonCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  } as ViewStyle,

  completeButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  } as TextStyle,

  completeButtonTextCompleted: {
    color: colors.white,
  } as TextStyle,

  exerciseParams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  exerciseParam: {
    ...typography.caption,
    color: colors.gray[600],
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '600',
  } as TextStyle,

  exerciseDescription: {
    ...typography.body,
    color: colors.gray[600],
  } as TextStyle,

  exerciseNotes: {
    ...typography.caption,
    color: colors.gray[600],
    fontStyle: 'italic',
  } as TextStyle,

  videoContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,

  video: {
    width: '100%',
    height: 200,
  } as ViewStyle,
});

export default ClientProgramViewEnhanced;