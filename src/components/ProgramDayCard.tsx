import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCard } from './ExerciseCard';
import { 
  getProgramDayExercises,
  isExerciseCompletedToday,
  logExerciseCompletion,
  type ExerciseCompletionData,
} from '../services/client-programs';
import type { ProgramDay, ProgramExercise, Exercise } from '../types';

interface ProgramDayCardProps {
  programDay: ProgramDay;
  clientProgramId: string;
  onExerciseComplete?: () => void;
}

type ProgramDayExerciseWithCompletion = ProgramExercise & {
  exercise: Exercise;
  isCompleted: boolean;
};

export const ProgramDayCard: React.FC<ProgramDayCardProps> = ({
  programDay,
  clientProgramId,
  onExerciseComplete,
}) => {
  const [exercises, setExercises] = useState<ProgramDayExerciseWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExercises = async () => {
    try {
      const dayExercises = await getProgramDayExercises(programDay.id);
      
      // Check completion status for each exercise
      const exercisesWithCompletion = await Promise.all(
        dayExercises.map(async (exercise) => {
          const isCompleted = await isExerciseCompletedToday(clientProgramId, exercise.id);
          return {
            ...exercise,
            isCompleted,
          };
        })
      );

      setExercises(exercisesWithCompletion);
    } catch (error) {
      console.error('Error loading program day exercises:', error);
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [programDay.id, clientProgramId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExercises();
  };

  const handleExerciseComplete = async (
    exerciseId: string,
    sets: number,
    reps: string,
    notes?: string
  ) => {
    try {
      const completionData: ExerciseCompletionData = {
        program_exercise_id: exerciseId,
        sets,
        reps,
        notes,
      };

      await logExerciseCompletion(clientProgramId, completionData);

      // Update local state to reflect completion
      setExercises(prev =>
        prev.map(exercise =>
          exercise.id === exerciseId
            ? { ...exercise, isCompleted: true }
            : exercise
        )
      );

      // Notify parent component
      onExerciseComplete?.();

      Alert.alert('Great Job!', 'Exercise completed successfully!');
    } catch (error) {
      console.error('Error completing exercise:', error);
      throw error; // Re-throw so ExerciseCard can handle it
    }
  };

  const getCompletionStats = () => {
    const completed = exercises.filter(ex => ex.isCompleted).length;
    const total = exercises.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.dayNumber}>Day {programDay.day_number}</Text>
          <Text style={styles.dayTitle}>{programDay.name || programDay.description}</Text>
          {programDay.description && programDay.name !== programDay.description && (
            <Text style={styles.dayDescription}>{programDay.description}</Text>
          )}
        </View>
        
        <View style={styles.progressSection}>
          <View style={[styles.progressCircle, stats.percentage === 100 && styles.completedCircle]}>
            <Text style={[styles.progressText, stats.percentage === 100 && styles.completedText]}>
              {stats.percentage}%
            </Text>
          </View>
          <Text style={styles.statsText}>
            {stats.completed}/{stats.total} exercises
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No exercises for this day</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              programExercise={exercise}
              isCompleted={exercise.isCompleted}
              onComplete={(sets, reps, notes) =>
                handleExerciseComplete(exercise.id, sets, reps, notes)
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleSection: {
    flex: 1,
    paddingRight: 16,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressSection: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  completedCircle: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  completedText: {
    color: '#FFFFFF',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 12,
  },
});