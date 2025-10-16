import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProgramExercise, Exercise } from '../types';

interface ExerciseCardProps {
  programExercise: ProgramExercise & { exercise: Exercise };
  isCompleted: boolean;
  onComplete: (sets: number, reps: string, notes?: string) => Promise<void>;
  disabled?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  programExercise,
  isCompleted,
  onComplete,
  disabled = false,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sets, setSets] = useState(programExercise.sets?.toString() || '2');
  const [reps, setReps] = useState(programExercise.reps?.toString() || '10');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { exercise } = programExercise;

  const handleCompleteExercise = async () => {
    if (!sets || !reps) {
      Alert.alert('Missing Information', 'Please enter both sets and reps');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(parseInt(sets), reps, notes.trim() || undefined);
      setShowCompletionModal(false);
      setSets(programExercise.sets?.toString() || '2');
      setReps(programExercise.reps?.toString() || '10');
      setNotes('');
    } catch (error) {
      console.error('Error completing exercise:', error);
      Alert.alert('Error', 'Failed to log exercise completion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatEquipment = (equipment: string[] | string | undefined) => {
    if (!equipment) return 'No equipment needed';
    if (Array.isArray(equipment)) {
      if (equipment.length === 0) return 'No equipment needed';
      return equipment
        .map(item => item?.replace(/_/g, ' ') || '')
        .filter(item => item)
        .map(item => item.charAt(0).toUpperCase() + item.slice(1))
        .join(', ');
    }
    return equipment.replace(/_/g, ' ');
  };

  const formatMuscleGroups = (muscleGroups: string[] | undefined) => {
    if (!muscleGroups || muscleGroups.length === 0) return 'General';
    return muscleGroups
      .map(group => group?.replace(/_/g, ' ') || '')
      .filter(group => group)
      .map(group => group.charAt(0).toUpperCase() + group.slice(1))
      .join(', ');
  };

  return (
    <>
      <View style={[styles.card, isCompleted && styles.completedCard]}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{exercise.title}</Text>
            <View style={styles.metaInfo}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty || 'beginner') }]}>
                <Text style={styles.difficultyText}>
                  {exercise.difficulty ? exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1) : 'Beginner'}
                </Text>
              </View>
              <Text style={styles.categoryText}>{(exercise.category || 'general').toUpperCase()}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted && styles.completedButton,
              disabled && styles.disabledButton,
            ]}
            onPress={() => setShowCompletionModal(true)}
            disabled={disabled}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>{exercise.description}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="fitness" size={16} color="#666" />
            <Text style={styles.detailText}>
              Target: {formatMuscleGroups(exercise.muscle_groups)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="barbell" size={16} color="#666" />
            <Text style={styles.detailText}>
              Equipment: {formatEquipment(exercise.equipment_needed || exercise.equipment)}
            </Text>
          </View>

          {(programExercise.sets || programExercise.reps) && (
            <View style={styles.detailRow}>
              <Ionicons name="refresh" size={16} color="#666" />
              <Text style={styles.detailText}>
                Recommended: {programExercise.sets || 2} sets × {programExercise.reps || 10} reps
              </Text>
            </View>
          )}

          {programExercise.rest_seconds && (
            <View style={styles.detailRow}>
              <Ionicons name="timer" size={16} color="#666" />
              <Text style={styles.detailText}>
                Rest: {Math.floor(programExercise.rest_seconds / 60)}:{(programExercise.rest_seconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={showCompletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowCompletionModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Log Exercise</Text>
              <TouchableOpacity
                onPress={handleCompleteExercise}
                style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sets</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="numeric"
                    placeholder="2"
                    maxLength={2}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                    placeholder="10"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did this feel? Any modifications?"
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.characterCount}>{notes.length}/200</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#F8F9FA',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    letterSpacing: 0.5,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseInfo: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputSection: {
    gap: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
});