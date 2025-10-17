/**
 * Exercise Creation/Edit Modal
 * 
 * Modal form for trainers to create or edit exercises with:
 * - All exercise fields (title, description, etc.)
 * - Thumbnail image upload
 * - Video upload with progress
 * - Validation and error handling
 * - Senior-friendly UI design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { InputField, Button } from '../../../components/ui';
import { FEATURES } from '../../../config/features';
import type { Exercise } from '../../../types';
import { createExercise, updateExercise } from '../../../services/content-library';

interface ExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exercise?: Exercise; // If provided, we're editing
}

interface ExerciseFormData {
  title: string;
  description: string;
  category: string;
  muscle_groups: string[]; // Array to match Exercise type
  difficulty: string;
  equipment: string;
  thumbnail_url?: string;
  video_url?: string;
}

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
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
  bodySmall: {
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

// Exercise categories
const CATEGORIES = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Balance',
  'Mobility',
  'Warm-up',
  'Cool-down',
  'Rehabilitation',
];

// Muscle groups
const MUSCLE_GROUPS = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Full Body',
  'Arms',
  'Legs',
  'Back',
  'Chest',
  'Shoulders',
  'Glutes',
];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

// Equipment options
const EQUIPMENT_OPTIONS = [
  'None',
  'Dumbbells',
  'Resistance Bands',
  'Chair',
  'Wall',
  'Mat',
  'Ball',
  'Other',
];

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  visible,
  onClose,
  onSuccess,
  exercise,
}) => {
  const [formData, setFormData] = useState<ExerciseFormData>({
    title: '',
    description: '',
    category: '',
    muscle_groups: [],
    difficulty: '',
    equipment: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Initialize form data when exercise prop changes
  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || '',
        description: exercise.description || '',
        category: exercise.category || '',
        muscle_groups: exercise.muscle_groups || [],
        difficulty: exercise.difficulty || '',
        equipment: exercise.equipment || '',
        thumbnail_url: exercise.thumbnail_url,
        video_url: exercise.video_url,
      });
    } else {
      // Reset form for new exercise
      setFormData({
        title: '',
        description: '',
        category: '',
        muscle_groups: [],
        difficulty: '',
        equipment: '',
      });
    }
    setThumbnailFile(null);
    setVideoFile(null);
    setUploadProgress(0);
  }, [exercise, visible]);

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise title.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise description.');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }
    if (!formData.difficulty) {
      Alert.alert('Validation Error', 'Please select a difficulty level.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setUploadProgress(0);

    try {
      if (exercise) {
        // Update existing exercise
        await updateExercise(exercise.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          muscle_groups: formData.muscle_groups.join(', '), // Convert array to string for service
          difficulty: formData.difficulty.toLowerCase(), // Convert to lowercase for database enum
          equipment: formData.equipment,
        });

        Alert.alert('Success', 'Exercise updated successfully!');
        onSuccess();
        onClose();
      } else {
        // Create new exercise (basic version without media upload)
        await createExercise({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          muscle_groups: formData.muscle_groups.join(', '), // Convert array to string for service
          difficulty: formData.difficulty.toLowerCase(), // Convert to lowercase for database enum
          equipment: formData.equipment,
          type: 'exercise',
        });

        Alert.alert('Success', 'Exercise created successfully!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    
    onClose();
  };

  const renderMultiSelectField = (
    label: string,
    values: string[],
    options: string[],
    onToggle: (value: string) => void
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                values.includes(option) && styles.selectedOption,
              ]}
              onPress={() => onToggle(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  values.includes(option) && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderDropdownField = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                value === option && styles.selectedOption,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (!FEATURES.CONTENT_LIBRARY_ENABLED || !FEATURES.EXERCISE_UPLOADS_ENABLED) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>
              {exercise ? 'Edit Exercise' : 'New Exercise'}
            </Text>
            
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          {saving && uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{uploadProgress}% uploaded</Text>
            </View>
          )}

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <InputField
                label="Exercise Title *"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                placeholder="e.g., Chair Squats"
              />

              <InputField
                label="Description *"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Describe how to perform this exercise"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exercise Details</Text>
              
              {renderDropdownField(
                'Category *',
                formData.category,
                CATEGORIES,
                (value) => setFormData((prev) => ({ ...prev, category: value }))
              )}

              {renderMultiSelectField(
                'Muscle Groups',
                formData.muscle_groups,
                MUSCLE_GROUPS,
                (value) => {
                  setFormData((prev) => ({
                    ...prev,
                    muscle_groups: prev.muscle_groups.includes(value)
                      ? prev.muscle_groups.filter(mg => mg !== value)
                      : [...prev.muscle_groups, value]
                  }));
                }
              )}

              {renderDropdownField(
                'Difficulty *',
                formData.difficulty,
                DIFFICULTY_LEVELS,
                (value) => setFormData((prev) => ({ ...prev, difficulty: value }))
              )}

              {renderDropdownField(
                'Equipment',
                formData.equipment,
                EQUIPMENT_OPTIONS,
                (value) => setFormData((prev) => ({ ...prev, equipment: value }))
              )}
            </View>

            {/* Media Uploads - Coming Soon */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Media</Text>
              <Text style={styles.comingSoonText}>
                Thumbnail and video uploads will be available soon.
              </Text>
            </View>

            {/* Spacer for keyboard */}
            <View style={styles.spacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  } as ViewStyle,

  cancelButtonText: {
    ...typography.body,
    color: colors.primary,
  } as TextStyle,

  title: {
    ...typography.h2,
    color: colors.gray[900],
  } as TextStyle,

  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  } as ViewStyle,

  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
  } as ViewStyle,

  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  } as ViewStyle,

  progressText: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginTop: 4,
    textAlign: 'center',
  } as TextStyle,

  form: {
    flex: 1,
  } as ViewStyle,

  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  } as ViewStyle,

  sectionTitle: {
    ...typography.h2,
    color: colors.gray[900],
    marginBottom: 16,
  } as TextStyle,

  fieldContainer: {
    marginBottom: 20,
  } as ViewStyle,

  fieldLabel: {
    ...typography.body,
    color: colors.gray[900],
    marginBottom: 8,
    fontWeight: '600',
  } as TextStyle,

  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,

  optionText: {
    ...typography.bodySmall,
    color: colors.gray[600],
  } as TextStyle,

  selectedOptionText: {
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  mediaSection: {
    marginBottom: 24,
  } as ViewStyle,

  mediaLabel: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,

  mediaDescription: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginBottom: 12,
  } as TextStyle,

  spacer: {
    height: 100,
  } as ViewStyle,

  comingSoonText: {
    ...typography.bodySmall,
    color: colors.gray[600],
    fontStyle: 'italic',
  } as TextStyle,
});

export default ExerciseModal;