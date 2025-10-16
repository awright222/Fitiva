/**
 * Program Builder Screen
 * 
 * Screen for trainers to create and manage fitness programs.
 * Features:
 * - Create multi-day programs
 * - Add exercises from content library
 * - Set reps, sets, duration for each exercise
 * - Preview program as client would see it
 * - Save and assign programs to clients
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Program CRUD:
 *    - Create: supabase.from('programs').insert()
 *    - Update: supabase.from('programs').update()
 *    - Delete: supabase.from('programs').delete()
 * 
 * 2. Program Days & Exercises:
 *    - Insert days: supabase.from('program_days').insert()
 *    - Insert exercises: supabase.from('program_exercises').insert()
 *    - Proper ordering with day_order and exercise_order
 * 
 * 3. Exercise Selection:
 *    - Load from content_library with same permissions as TrainerContentLibraryScreen
 *    - Real-time search and filtering
 * 
 * 4. Client Assignment:
 *    - Insert into client_programs table
 *    - Set assignment_date and is_active
 *    - Notification to client (if messaging enabled)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';

import { SectionHeader, Button, InputField } from '../../../components/ui';
import { ExerciseCard, ExerciseFilter } from '../components';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES } from '../../../config/features';
import type { Exercise, ProgramDay, ProgramExercise, ExerciseFilters } from '../types';
import type { Program } from '../../../types'; // Use main Program type to match service return type
import { getExercises, createProgram, updateProgram, getProgramAssignments, getClientsForAssignment, getClients, assignProgramToClients, saveClientAssignments, createProgramDay, createProgramExercise } from '../../../services/content-library';
import { supabase } from '../../../services/supabase';
import { TrainerProgramsStackParamList } from '../../../navigation/types';

type ProgramBuilderScreenNavigationProp = StackNavigationProp<TrainerProgramsStackParamList, 'ProgramBuilder'>;
type ProgramBuilderScreenRouteProp = StackScreenProps<TrainerProgramsStackParamList, 'ProgramBuilder'>['route'];

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

type ProgramFormData = {
  title: string;
  description: string;
  duration_weeks: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  days: ProgramDay[];
};

export const ProgramBuilderScreen: React.FC = () => {
  const navigation = useNavigation<ProgramBuilderScreenNavigationProp>();
  const route = useRoute<ProgramBuilderScreenRouteProp>();
  const { user } = useAuth();
  
  const isEdit = route.params?.mode === 'edit';
  const existingProgram = route.params?.program;

  // Form state - ensure all values are always defined to prevent controlled/uncontrolled warnings
  const [formData, setFormData] = useState<ProgramFormData>({
    title: existingProgram?.title ?? '',
    description: existingProgram?.description ?? '',
    duration_weeks: existingProgram?.duration_weeks ?? 4,
    difficulty: existingProgram?.difficulty ?? 'beginner',
    days: existingProgram?.days ?? [],
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseFilters, setExerciseFilters] = useState<ExerciseFilters>({});

  // Client assignment state
  const [assignedClients, setAssignedClients] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);

  // Load exercises for selection
  useEffect(() => {
    loadExercises();
  }, [exerciseFilters]);

  // Load client data for edit mode
  useEffect(() => {
    if (isEdit && existingProgram) {
      loadProgramAssignments();
      loadFullProgramData(); // Load complete program structure from database
    }
    loadAvailableClients();
  }, [isEdit, existingProgram]);

  // Load complete program data from database when editing
  const loadFullProgramData = async () => {
    if (!existingProgram?.id) return;
    
    try {
      console.log('Loading full program data for ID:', existingProgram.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          program_days(
            id,
            day_number,
            notes,
            program_exercises(
              id,
              exercise_id,
              sets,
              reps,
              weight,
              percentage,
              rpe,
              notes,
              exercise:content_library(
                id,
                title,
                description
              )
            )
          )
        `)
        .eq('id', existingProgram.id)
        .single();

      if (error) {
        console.error('Error loading full program data:', error);
        return;
      }

      if (data && data.program_days) {
        console.log('Full program data loaded:', data);
        console.log('Program days found:', data.program_days.length);
        
        // Update form data with loaded program structure
        setFormData(prev => ({
          ...prev,
          days: data.program_days.map((day: any) => ({
            id: day.id ?? Date.now(),
            program_id: data.id ?? 0,
            day_number: day.day_number ?? 1,
            title: `Day ${day.day_number ?? 1}`,
            description: day.notes ?? '',
            is_rest_day: false,
            created_at: day.created_at ?? new Date().toISOString(),
            exercises: (day.program_exercises || []).map((ex: any) => ({
              id: ex.id ?? Date.now(),
              program_day_id: day.id ?? 0,
              exercise_id: ex.exercise_id ?? 0,
              order_index: 1,
              sets: ex.sets ?? 3,
              reps: (ex.reps ?? 10).toString(),
              weight_kg: ex.weight ?? 0,
              rpe: ex.rpe ?? 6,
              rest_seconds: ex.rest_seconds ?? 60,
              notes: ex.notes ?? '',
              is_superset: false,
              created_at: ex.created_at ?? new Date().toISOString(),
              exercise: ex.exercise, // Include exercise details
            }))
          }))
        }));
        
        console.log('Form data updated with', data.program_days.length, 'days');
      }
    } catch (error) {
      console.error('Error in loadFullProgramData:', error);
    }
  };

  const loadExercises = async () => {
    try {
      // TODO: Replace with Supabase query
      const response = await getExercises(exerciseFilters);
      setExercises(response.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadProgramAssignments = async () => {
    if (!existingProgram?.id) return;
    
    try {
      const assignments = await getProgramAssignments(existingProgram.id);
      setAssignedClients(assignments.map(a => a.client_id));
    } catch (error) {
      console.error('Error loading program assignments:', error);
    }
  };

  const loadAvailableClients = async () => {
    try {
      const clients = await getClients();
      setAvailableClients(clients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const toggleClientAssignment = (clientId: string) => {
    setAssignedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const getAssignedClientNames = () => {
    return assignedClients
      .map(id => availableClients.find(client => client.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleSaveClientAssignments = async () => {
    if (!existingProgram?.id) {
      Alert.alert('Error', 'Cannot save assignments - program not found');
      return;
    }

    try {
      console.log('Saving client assignments for program:', existingProgram.id);
      console.log('Selected clients:', assignedClients);
      
      await saveClientAssignments(existingProgram.id, assignedClients);
      console.log('Client assignments saved successfully');
      // Reload the program assignments to refresh the UI
      await loadProgramAssignments();
      setShowClientSelector(false);
      Alert.alert('Success', `Updated client assignments for ${existingProgram.title}. Check the program screen!`);
    } catch (error) {
      console.error('Error saving client assignments:', error);
      Alert.alert('Error', 'Failed to save client assignments');
    }
  };

  const addDay = () => {
    const newDay: ProgramDay = {
      id: Date.now(),
      program_id: existingProgram?.id || '',
      day_number: formData.days.length + 1,
      title: `Day ${formData.days.length + 1}`,
      description: '',
      is_rest_day: false,
      exercises: [],
      created_at: new Date().toISOString(),
    };

    setFormData(prev => ({
      ...prev,
      days: [...prev.days, newDay],
    }));
  };

  const removeDay = (dayIndex: number) => {
    Alert.alert(
      'Remove Day',
      `Are you sure you want to remove ${formData.days[dayIndex].title}? All exercises in this day will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              days: prev.days.filter((_, index) => index !== dayIndex),
            }));
          },
        },
      ]
    );
  };

  const updateDay = (dayIndex: number, updates: Partial<ProgramDay>) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, ...updates }
          : day
      ),
    }));
  };

  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    const newProgramExercise: ProgramExercise = {
      id: Date.now(),
      program_day_id: formData.days[dayIndex].id,
      exercise_id: exercise.id,
      exercise: exercise,
      order_index: (formData.days[dayIndex].exercises?.length || 0) + 1,
      sets: 3,
      reps: "10",
      rest_seconds: 60,
      notes: '',
      is_superset: false,
      created_at: new Date().toISOString(),
    };

    updateDay(dayIndex, {
      exercises: [...(formData.days[dayIndex].exercises || []), newProgramExercise],
    });

    setShowExerciseSelector(false);
    setSelectedDayIndex(null);
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    const day = formData.days[dayIndex];
    const exercises = day.exercises || [];
    const exercise = exercises[exerciseIndex];

    Alert.alert(
      'Remove Exercise',
      `Remove "${exercise.exercise?.title}" from ${day.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            updateDay(dayIndex, {
              exercises: exercises.filter((_, index) => index !== exerciseIndex),
            });
          },
        },
      ]
    );
  };

  const updateProgramExercise = (dayIndex: number, exerciseIndex: number, updates: Partial<ProgramExercise>) => {
    const day = formData.days[dayIndex];
    const exercises = day.exercises || [];
    const updatedExercises = exercises.map((ex, index) =>
      index === exerciseIndex
        ? { ...ex, ...updates }
        : ex
    );

    updateDay(dayIndex, { exercises: updatedExercises });
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Program title is required';
    if (!formData.description.trim()) return 'Program description is required';
    if (formData.duration_weeks < 1 || formData.duration_weeks > 52) return 'Duration must be between 1-52 weeks';
    if (formData.days.length === 0) return 'Program must have at least one day';
    
    for (const day of formData.days) {
      if (!day.title.trim()) return 'All days must have a title';
      if (!day.exercises || day.exercises.length === 0) return 'All days must have at least one exercise';
    }

    return null;
  };

  const handleAssignClients = (program: any) => {
    // TODO: Navigate to client assignment screen
    // For now, just show an alert
    Alert.alert(
      'Client Assignment',
      `Assigning clients to program: ${program.name}`,
      [{ text: 'OK' }]
    );
  };

  // Save program structure (days and exercises) - simplified version
  const saveProgramStructure = async (programId: number, days: ProgramDay[]) => {
    console.log('Saving program structure for program ID:', programId);
    console.log('Days to save:', days);
    
    // TODO: For now, we'll only handle creation. In the future, add update logic.
    // This handles the case where user adds exercises to a program.
    
    for (const day of days) {
      // Always create new days for now (future: check if day.id exists to update)
      console.log('Creating new day:', day.title);
      const savedDay = await createProgramDay({
        program_id: programId,
        day_number: day.day_number,
        notes: day.description || day.title, // Use notes field for description
      });
      
      // Save exercises for this day
      if (day.exercises && day.exercises.length > 0) {
        console.log(`Creating ${day.exercises.length} exercises for day ${savedDay.id}`);
        for (const exercise of day.exercises) {
          console.log('Creating new exercise for day:', savedDay.id);
          await createProgramExercise({
            program_day_id: savedDay.id,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: parseInt(exercise.reps) || 0,
            weight: exercise.weight_kg,
            rpe: exercise.rpe,
          });
        }
      }
    }
    
    console.log('Program structure saved successfully');
  };

  const saveProgram = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setSaving(true);

      const programData = {
        title: formData.title,
        description: formData.description || '',
        duration_weeks: formData.duration_weeks,
        difficulty: formData.difficulty,
        is_template: false,
        goals: ['general_fitness'], // TODO: Add goal selection
      };

      let savedProgram: Program;
      
      if (isEdit && existingProgram) {
        // Update existing program
        console.log('ProgramBuilder: Updating existing program ID:', existingProgram.id);
        console.log('ProgramBuilder: Update data:', programData);
        console.log('ProgramBuilder: Days to save:', formData.days);
        savedProgram = await updateProgram(existingProgram.id, programData);
        console.log('ProgramBuilder: Update response:', savedProgram);
        
        // For edit: only save structure if there are days with exercises to add
        if (formData.days && formData.days.length > 0) {
          console.log('Saving additional days/exercises for existing program');
          await saveProgramStructure(savedProgram.id, formData.days);
        }
      } else {
        // Create new program
        console.log('ProgramBuilder: Creating new program with data:', programData);
        console.log('ProgramBuilder: Days to save:', formData.days);
        savedProgram = await createProgram(programData);
        console.log('ProgramBuilder: Create response:', savedProgram);
        
        // Save program days and exercises for new program
        if (formData.days && formData.days.length > 0) {
          await saveProgramStructure(savedProgram.id, formData.days);
        }
      }

      Alert.alert(
        'Success',
        `Program "${formData.title}" has been ${isEdit ? 'updated' : 'created'} successfully!`,
        [
          {
            text: 'Done',
            onPress: () => {
              console.log('ProgramBuilder: User selected Done - navigating back');
              navigation.goBack();
            },
          },
          {
            text: 'Assign to Clients',
            onPress: () => handleAssignClients(savedProgram),
          },
        ]
      );

    } catch (error) {
      console.error('Error saving program:', error);
      Alert.alert(
        'Error',
        `Unable to ${isEdit ? 'update' : 'create'} program. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const openExerciseSelector = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowExerciseSelector(true);
  };

  const renderDayCard = (day: ProgramDay, dayIndex: number) => (
    <View key={day.id} style={styles.dayCard}>
      {/* Day Header */}
      <View style={styles.dayHeader}>
        <View style={styles.dayTitleContainer}>
          <TextInput
            style={styles.dayTitleInput}
            value={day.title}
            onChangeText={(text) => updateDay(dayIndex, { title: text })}
            placeholder="Day title"
            multiline={false}
          />
          <TouchableOpacity
            style={styles.removeDayButton}
            onPress={() => removeDay(dayIndex)}
          >
            <Ionicons name="trash" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.dayDescriptionInput}
          value={day.description || ''}
          onChangeText={(text) => updateDay(dayIndex, { description: text })}
          placeholder="Day description (optional)"
          multiline={true}
          numberOfLines={2}
        />
      </View>

      {/* Exercises */}
      <View style={styles.exercisesContainer}>
        {(day.exercises || []).map((programExercise, exerciseIndex) => (
          <View key={programExercise.id} style={styles.programExerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseTitle}>
                {programExercise.exercise?.title}
              </Text>
              <TouchableOpacity
                style={styles.removeExerciseButton}
                onPress={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
              >
                <Ionicons name="close" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Exercise Parameters */}
            <View style={styles.exerciseParams}>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Sets:</Text>
                <TextInput
                  style={styles.paramInput}
                  value={programExercise.sets?.toString() || ''}
                  onChangeText={(text) => 
                    updateProgramExercise(dayIndex, exerciseIndex, { 
                      sets: parseInt(text) || 0 
                    })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Reps:</Text>
                <TextInput
                  style={styles.paramInput}
                  value={programExercise.reps || ''}
                  onChangeText={(text) => 
                    updateProgramExercise(dayIndex, exerciseIndex, { 
                      reps: text 
                    })
                  }
                  placeholder="8-12"
                />
              </View>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Rest (sec):</Text>
                <TextInput
                  style={styles.paramInput}
                  value={programExercise.rest_seconds?.toString() || ''}
                  onChangeText={(text) => 
                    updateProgramExercise(dayIndex, exerciseIndex, { 
                      rest_seconds: parseInt(text) || 0 
                    })
                  }
                  keyboardType="numeric"
                  placeholder="60"
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => openExerciseSelector(dayIndex)}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!FEATURES.PROGRAM_BUILDER_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledState}>
          <Ionicons name="construct" size={64} color={colors.gray[600]} />
          <Text style={styles.disabledTitle}>Program Builder Coming Soon</Text>
          <Text style={styles.disabledDescription}>
            The program builder feature is currently under development.
            Check back soon for the ability to create custom workout programs!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <SectionHeader
        title={isEdit ? 'Edit Program' : 'Create Program'}
        subtitle="Build a custom workout program"
        actionText="Save"
        onActionPress={saveProgram}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Info */}
        <View style={styles.programInfoCard}>
          <InputField
            label="Program Title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Enter program name"
          />

          <InputField
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe this program"
            multiline={true}
            numberOfLines={3}
          />

          <View style={styles.inlineInputs}>
            <View style={styles.halfInput}>
              <InputField
                label="Duration (weeks)"
                value={formData.duration_weeks.toString()}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  duration_weeks: parseInt(text) || 1 
                }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      formData.difficulty === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      formData.difficulty === level && styles.difficultyButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Client Assignments (Edit Mode Only) */}
        {isEdit && (
          <View style={styles.clientAssignmentCard}>
            <View style={styles.clientAssignmentHeader}>
              <Text style={styles.cardTitle}>Client Assignments</Text>
              <TouchableOpacity 
                style={styles.manageClientsButton}
                onPress={() => setShowClientSelector(true)}
              >
                <Ionicons name="people" size={16} color={colors.primary} />
                <Text style={styles.manageClientsButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            {assignedClients.length > 0 ? (
              <View style={styles.assignedClientsContainer}>
                <Text style={styles.assignedClientsText}>
                  Assigned to: {getAssignedClientNames()}
                </Text>
                <Text style={styles.assignedClientsCount}>
                  {assignedClients.length} client{assignedClients.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.noClientsAssigned}>
                <Ionicons name="people-outline" size={24} color={colors.gray[600]} />
                <Text style={styles.noClientsText}>No clients assigned</Text>
                <Text style={styles.noClientsSubtext}>Tap "Manage" to assign clients to this program</Text>
              </View>
            )}
          </View>
        )}

        {/* Days */}
        <View style={styles.daysSection}>
          <View style={styles.daysSectionHeader}>
            <Text style={styles.daysSectionTitle}>Program Days</Text>
            <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addDayButtonText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          {formData.days.map((day, dayIndex) => renderDayCard(day, dayIndex))}

          {formData.days.length === 0 && (
            <View style={styles.emptyDaysState}>
              <Ionicons name="calendar" size={48} color={colors.gray[600]} />
              <Text style={styles.emptyDaysTitle}>No Days Added</Text>
              <Text style={styles.emptyDaysDescription}>
                Add your first day to start building the program.
              </Text>
              <Button
                title="Add First Day"
                onPress={addDay}
                style={styles.emptyDaysButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Selector Modal */}
      <Modal
        visible={showExerciseSelector}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowExerciseSelector(false);
                setSelectedDayIndex(null);
              }}
            >
              <Ionicons name="close" size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ExerciseFilter
            filters={exerciseFilters}
            onFiltersChange={setExerciseFilters}
            showMyExercises={true}
            currentUserId={user?.id}
          />

          <ScrollView style={styles.exerciseList}>
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() => selectedDayIndex !== null && addExerciseToDay(selectedDayIndex, exercise)}
                showActions={false}
                compact={true}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Client Selector Modal */}
      <Modal
        visible={showClientSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowClientSelector(false)}>
              <Ionicons name="close" size={24} color={colors.gray[900]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assign Clients</Text>
            <TouchableOpacity onPress={handleSaveClientAssignments}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Select clients to assign this program to:
            </Text>

            {availableClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientItem,
                  assignedClients.includes(client.id) && styles.clientItemSelected
                ]}
                onPress={() => toggleClientAssignment(client.id)}
              >
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  {client.email && (
                    <Text style={styles.clientEmail}>{client.email}</Text>
                  )}
                </View>
                {assignedClients.includes(client.id) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  } as ViewStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  programInfoCard: {
    backgroundColor: colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
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

  clientAssignmentCard: {
    backgroundColor: colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
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

  clientAssignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  cardTitle: {
    ...typography.h3,
    color: colors.gray[900],
  } as TextStyle,

  manageClientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    gap: 4,
  } as ViewStyle,

  manageClientsButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,

  assignedClientsContainer: {
    gap: 4,
  } as ViewStyle,

  assignedClientsText: {
    ...typography.body,
    color: colors.gray[900],
  } as TextStyle,

  assignedClientsCount: {
    ...typography.caption,
    color: colors.gray[600],
  } as TextStyle,

  noClientsAssigned: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  } as ViewStyle,

  noClientsText: {
    ...typography.body,
    color: colors.gray[600],
    fontWeight: '600',
  } as TextStyle,

  noClientsSubtext: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  } as TextStyle,

  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  halfInput: {
    flex: 1,
  } as ViewStyle,

  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  } as TextStyle,

  difficultyButtons: {
    flexDirection: 'row',
    gap: 4,
  } as ViewStyle,

  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  } as ViewStyle,

  difficultyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,

  difficultyButtonText: {
    ...typography.caption,
    color: colors.gray[600],
  } as TextStyle,

  difficultyButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  daysSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  } as ViewStyle,

  daysSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  daysSectionTitle: {
    ...typography.h3,
    color: colors.gray[900],
  } as TextStyle,

  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  } as ViewStyle,

  addDayButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  } as TextStyle,

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
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  } as ViewStyle,

  dayTitleInput: {
    flex: 1,
    ...typography.h3,
    color: colors.gray[900],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.gray[50],
  } as TextStyle,

  removeDayButton: {
    padding: 8,
  } as ViewStyle,

  dayDescriptionInput: {
    ...typography.body,
    color: colors.gray[600],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    minHeight: 60,
    // Use verticalAlign for web compatibility
    ...(Platform.OS === 'web' 
      ? { verticalAlign: 'top' }
      : { textAlignVertical: 'top' }
    ),
  } as TextStyle,

  exercisesContainer: {
    gap: 12,
  } as ViewStyle,

  programExerciseCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  exerciseTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
  } as TextStyle,

  removeExerciseButton: {
    padding: 4,
  } as ViewStyle,

  exerciseParams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  } as ViewStyle,

  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  } as ViewStyle,

  paramLabel: {
    ...typography.caption,
    color: colors.gray[600],
    marginRight: 8,
    minWidth: 50,
  } as TextStyle,

  paramInput: {
    ...typography.caption,
    color: colors.gray[900],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 4,
    backgroundColor: colors.white,
    minWidth: 60,
    textAlign: 'center',
  } as TextStyle,

  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: colors.white,
  } as ViewStyle,

  addExerciseButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  } as TextStyle,

  emptyDaysState: {
    alignItems: 'center',
    paddingVertical: 48,
  } as ViewStyle,

  emptyDaysTitle: {
    ...typography.h3,
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,

  emptyDaysDescription: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  emptyDaysButton: {
    minWidth: 150,
  } as ViewStyle,

  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  } as ViewStyle,

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  modalTitle: {
    ...typography.h3,
    color: colors.gray[900],
  } as TextStyle,

  modalCloseButton: {
    padding: 8,
  } as ViewStyle,

  exerciseList: {
    flex: 1,
    paddingVertical: 8,
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

  modalDoneText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,

  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  } as ViewStyle,

  modalSubtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: 16,
  } as TextStyle,

  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  clientItemSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  } as ViewStyle,

  clientInfo: {
    flex: 1,
  } as ViewStyle,

  clientName: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  } as TextStyle,

  clientEmail: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: 2,
  } as TextStyle,
});