/**
 * Trainer Content Library Screen
 * 
 * Main screen for trainers to manage their exercise library.
 * Features:
 * - View all available exercises (global + own)
 * - Filter and search exercises
 * - Upload new exercises with thumbnails/videos
 * - Edit and delete own exercises
 * - Large, accessible design for seniors
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * =============        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowPrograms(!showPrograms)}
        >
          <Ionicons name="eye" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>
            {showPrograms ? 'Hide Programs' : 'View Programs'}
          </Text>
        </TouchableOpacity>============
 * 
 * 1. Exercise Loading:
 *    - Replace with: supabase.from('content_library').select('*').or('is_global.eq.true,created_by.eq.${userId}')
 *    - Add pagination with .range() for large libraries
 * 
 * 2. File Uploads:
 *    - Thumbnail: supabase.storage.from('exercise-thumbnails').upload()
 *    - Video: supabase.storage.from('exercise-videos').upload()
 *    - Progress tracking during uploads
 * 
 * 3. Real-time Updates:
 *    - Subscribe to exercise changes: supabase.channel('exercises').on('INSERT|UPDATE|DELETE')
 * 
 * 4. Permission Control:
 *    - Use RLS policies to ensure trainers can only edit/delete their own exercises
 *    - WHITE_LABEL_ENABLED: Allow org-level exercise sharing
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
  Modal,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ExerciseCard, ExerciseFilter } from '../components';
import { SectionHeader, Button } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES } from '../../../config/features';
import type { Exercise, ExerciseFilters, Program } from '../types';
import { getExercises, deleteExercise, getPrograms } from '../data/mockData';
import { TrainerProgramsStackParamList } from '../../../navigation/types';

// TODO: Import proper navigation types
type TrainerContentLibraryScreenNavigationProp = StackNavigationProp<TrainerProgramsStackParamList, 'ContentLibrary'>;

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  danger: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
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
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
} as const;

export const TrainerContentLibraryScreen: React.FC = () => {
  const navigation = useNavigation<TrainerContentLibraryScreenNavigationProp>();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);

  // Load data when component mounts or filters change
  useEffect(() => {
    loadData();
  }, [filters, user?.id]);

  // Focus listener to refresh when returning from ProgramBuilder
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused - refreshing programs...');
      loadPrograms();
    });
    return unsubscribe;
  }, [navigation]);

  // Auto-show programs section if programs exist
  useEffect(() => {
    if (programs.length > 0 && !showPrograms) {
      setShowPrograms(true);
    }
  }, [programs.length]);

  // TODO: Replace with Supabase query
  const loadExercises = async () => {
    try {
      // TODO: When implementing Supabase:
      // const { data, error } = await supabase
      //   .from('content_library')
      //   .select('*')
      //   .or(`is_global.eq.true,created_by.eq.${user?.id}`)
      //   .order('created_at', { ascending: false });
      
      const response = await getExercises(filters);
      setExercises(response.exercises);
      
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert(
        'Error',
        'Unable to load exercise library. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadPrograms = async () => {
    try {
      setProgramsLoading(true);
      console.log('Loading programs for user:', user?.id);
      // TODO: When implementing Supabase:
      // const { data, error } = await supabase
      //   .from('programs')
      //   .select('*')
      //   .eq('trainer_id', user?.id)
      //   .order('created_at', { ascending: false });
      
      const response = await getPrograms({ created_by: user?.id });
      console.log('Programs response:', response);
      setPrograms(response.programs);
      console.log('Set programs state:', response.programs.length, 'programs');
      
    } catch (error) {
      console.error('Error loading programs:', error);
      Alert.alert(
        'Error',
        'Unable to load programs. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProgramsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadExercises(), loadPrograms()]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddExercise = () => {
    if (!FEATURES.EXERCISE_UPLOADS_ENABLED) {
      Alert.alert(
        'Feature Coming Soon',
        'Exercise uploads will be available in a future update.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // TODO: Navigate to ExerciseFormScreen
    // navigation.navigate('ExerciseForm', { mode: 'create' });
    Alert.alert(
      'Add Exercise',
      'Exercise creation form coming soon! You\'ll be able to:\n\n• Add title and description\n• Upload thumbnail image\n• Upload demo video\n• Set difficulty and muscle groups',
      [{ text: 'OK' }]
    );
  };

  const handleCreateProgram = () => {
    if (!FEATURES.PROGRAM_BUILDER_ENABLED) {
      Alert.alert(
        'Feature Coming Soon',
        'Program builder will be available in a future update.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // TODO: Navigate to ProgramBuilderScreen
    // navigation.navigate('ProgramBuilder', { mode: 'create' });
    Alert.alert(
      'Create Program',
      'Program builder opening soon! You\'ll be able to:\n\n• Create multi-day programs\n• Add exercises from library\n• Set reps, sets, and rest periods\n• Assign to clients',
      [{ text: 'OK' }]
    );
  };

  const handleEditExercise = (exercise: Exercise) => {
    if (exercise.created_by !== user?.id) {
      Alert.alert(
        'Cannot Edit',
        'You can only edit exercises that you created.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // TODO: Navigate to ExerciseFormScreen
    // navigation.navigate('ExerciseForm', { mode: 'edit', exercise });
    Alert.alert(
      'Edit Exercise',
      `Edit "${exercise.title}" form coming soon!`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    if (exercise.created_by !== user?.id) {
      Alert.alert(
        'Cannot Delete',
        'You can only delete exercises that you created.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with Supabase delete
              const success = await deleteExercise(exercise.id);
              if (success) {
                setExercises(prev => prev.filter(ex => ex.id !== exercise.id));
                Alert.alert('Success', 'Exercise deleted successfully.');
              } else {
                throw new Error('Delete failed');
              }
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert(
                'Error',
                'Unable to delete exercise. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleExercisePress = (exercise: Exercise) => {
    // TODO: Navigate to ExerciseDetailScreen
    // navigation.navigate('ExerciseDetail', { exercise });
    Alert.alert(
      exercise.title,
      `${exercise.description}\n\nDifficulty: ${exercise.difficulty}\nMuscle Groups: ${exercise.muscle_groups.join(', ')}\nEquipment: ${exercise.equipment}`,
      [{ text: 'OK' }]
    );
  };

  const renderProgram = ({ item }: { item: Program }) => (
    <TouchableOpacity style={styles.programCard}>
      <View style={styles.programHeader}>
        <Text style={styles.programTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.programDuration}>{item.duration_weeks}w</Text>
      </View>
      <Text style={styles.programDescription} numberOfLines={3}>
        {item.description}
      </Text>
      <View style={styles.programMeta}>
        <Text style={styles.programDifficulty}>{item.difficulty}</Text>
        <Text style={styles.programDays}>{item.days?.length || 0} days</Text>
      </View>
    </TouchableOpacity>
  );

  const renderExercise = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      exercise={item}
      onPress={handleExercisePress}
      onEdit={item.created_by === user?.id ? handleEditExercise : undefined}
      onDelete={item.created_by === user?.id ? handleDeleteExercise : undefined}
      showActions={item.created_by === user?.id}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="fitness" size={64} color={colors.gray[600]} />
      <Text style={styles.emptyStateTitle}>No Exercises Found</Text>
      <Text style={styles.emptyStateDescription}>
        {Object.keys(filters).length > 0
          ? 'Try adjusting your filters to see more exercises.'
          : 'Start building your exercise library by adding your first exercise!'
        }
      </Text>
      {Object.keys(filters).length === 0 && (
        <Button
          title="Add First Exercise"
          onPress={handleAddExercise}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  const getFilterCount = (): number => {
    let count = 0;
    if (filters.search) count++;
    if (filters.muscle_groups?.length) count++;
    if (filters.equipment?.length) count++;
    if (filters.difficulty?.length) count++;
    if (filters.category?.length) count++;
    if (filters.created_by) count++;
    if (filters.has_video) count++;
    if (filters.has_thumbnail) count++;
    return count;
  };

  const filterCount = getFilterCount();

  if (!FEATURES.CONTENT_LIBRARY_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledState}>
          <Ionicons name="construct" size={64} color={colors.gray[600]} />
          <Text style={styles.disabledTitle}>Content Library Coming Soon</Text>
          <Text style={styles.disabledDescription}>
            The exercise library and program builder features are currently under development.
            Check back soon for the ability to create and manage custom workouts!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <SectionHeader
        title="Exercise Library"
        subtitle={`${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} available`}
        actionText="Add"
        onActionPress={handleAddExercise}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.programsButton}
          onPress={() => {
            navigation.navigate('ProgramBuilder', { mode: 'create' });
          }}
        >
          <Ionicons name="fitness" size={24} color={colors.white} />
          <Text style={styles.programsButtonText}>Build Program</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.myProgramsButton}
          onPress={() => setShowPrograms(!showPrograms)}
        >
          <Ionicons name="list" size={24} color={colors.primary} />
          <Text style={styles.myProgramsButtonText}>
            {showPrograms ? 'Hide Programs' : `My Programs (${programs.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateProgram}
        >
          <Ionicons name="add-circle" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Create Program</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Programs', 'View existing programs feature coming soon!')}
        >
          <Ionicons name="list" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>View Programs</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={filterCount > 0 ? colors.white : colors.gray[600]} 
          />
          <Text style={[styles.filterButtonText, filterCount > 0 && styles.filterButtonTextActive]}>
            Filter {filterCount > 0 && `(${filterCount})`}
          </Text>
        </TouchableOpacity>

        {filterCount > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({})}
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Programs Section */}
      {showPrograms && (
        <View style={styles.programsSection}>
          <SectionHeader
            title="My Programs"
            actionText="Create New"
            onActionPress={handleCreateProgram}
          />
          
          {programsLoading ? (
            <View style={styles.emptyProgramsState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyProgramsSubtext}>Loading programs...</Text>
            </View>
          ) : programs.length === 0 ? (
            <View style={styles.emptyProgramsState}>
              <Ionicons name="fitness-outline" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyProgramsText}>No programs created yet</Text>
              <Text style={styles.emptyProgramsSubtext}>
                Create your first program to get started
              </Text>
              <Button
                title="Create Program"
                onPress={handleCreateProgram}
                style={styles.emptyProgramsButton}
              />
            </View>
          ) : (
            <FlatList
              data={programs}
              renderItem={renderProgram}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programsList}
            />
          )}
        </View>
      )}

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={loading ? null : renderEmptyState}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ExerciseFilter
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
          showMyExercises={true}
          currentUserId={user?.id}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  } as ViewStyle,

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.primary,
  } as ViewStyle,

  actionButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  } as TextStyle,

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,

  filterButtonText: {
    ...typography.body,
    color: colors.gray[600],
    marginLeft: 8,
  } as TextStyle,

  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  } as ViewStyle,

  clearFiltersText: {
    ...typography.body,
    color: colors.primary,
  } as TextStyle,

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  programsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 8,
  } as ViewStyle,

  programsButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  myProgramsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  } as ViewStyle,

  myProgramsButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,

  listContent: {
    paddingVertical: 8,
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
    marginBottom: 24,
  } as TextStyle,

  emptyStateButton: {
    minWidth: 200,
  } as ViewStyle,

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

  // Programs Section Styles
  programsSection: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    // Cross-platform shadow/box-shadow
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
    ),
  } as ViewStyle,

  programsList: {
    paddingHorizontal: 16,
  } as ViewStyle,

  programCard: {
    width: 200,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  } as ViewStyle,

  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  } as TextStyle,

  programDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  } as TextStyle,

  programDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
    lineHeight: 20,
  } as TextStyle,

  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  programDifficulty: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    textTransform: 'capitalize',
  } as TextStyle,

  programDays: {
    fontSize: 12,
    color: colors.gray[600],
  } as TextStyle,

  emptyProgramsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  } as ViewStyle,

  emptyProgramsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  emptyProgramsSubtext: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  emptyProgramsButton: {
    marginTop: 8,
  } as ViewStyle,
});