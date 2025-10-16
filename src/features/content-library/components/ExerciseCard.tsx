/**
 * Exercise Card Component
 * 
 * Displays exercise information in a card format with thumbnail,
 * title, muscle groups, and difficulty. Used in exercise libraries
 * and program builders.
 * 
 * Features:
 * - Large, accessible design for seniors
 * - Exercise thumbnail with fallback
 * - Clear difficulty and muscle group indicators
 * - Action buttons for edit/delete (trainer view)
 * - Tap to select (program builder)
 * - Video play indicator
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Exercise } from '../types';

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#4b5563',
    700: '#374151',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  showActions?: boolean; // Show edit/delete buttons
  isSelected?: boolean; // For program builder selection
  showDuration?: boolean;
  compact?: boolean; // Smaller card for lists
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  isSelected = false,
  showDuration = true,
  compact = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.danger;
      default: return colors.gray[600];
    }
  };

  const formatMuscleGroups = (groups: string[]): string => {
    if (groups.length === 0) return 'Full body';
    if (groups.length <= 2) return groups.join(', ');
    return `${groups[0]}, ${groups[1]} +${groups.length - 2}`;
  };

  const cardHeight = compact ? 100 : 140;
  const imageSize = compact ? 60 : 80;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { minHeight: cardHeight },
        isSelected && styles.selectedContainer,
        compact && styles.compactContainer,
      ]}
      onPress={() => onPress(exercise)}
      accessibilityLabel={`Exercise: ${exercise.title}`}
      accessibilityHint={`${exercise.difficulty} difficulty, targets ${formatMuscleGroups(exercise.muscle_groups)}`}
    >
      {/* Exercise Thumbnail */}
      <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
        {exercise.thumbnail_url ? (
          <Image
            source={{ uri: exercise.thumbnail_url }}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { width: imageSize, height: imageSize }]}>
            <Ionicons 
              name="fitness" 
              size={compact ? 24 : 32} 
              color={colors.gray[600]} 
            />
          </View>
        )}
        
        {/* Video Indicator */}
        {exercise.video_url && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play-circle" size={20} color={colors.white} />
          </View>
        )}
      </View>

      {/* Exercise Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={1}>
            {exercise.title}
          </Text>
          
          {/* Difficulty Badge */}
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
            <Text style={styles.difficultyText}>
              {exercise.difficulty.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {exercise.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.muscleGroups}>
            <Ionicons name="body" size={14} color={colors.gray[600]} />
            <Text style={styles.metaText} numberOfLines={1}>
              {formatMuscleGroups(exercise.muscle_groups)}
            </Text>
          </View>

          {showDuration && exercise.estimated_duration && (
            <View style={styles.duration}>
              <Ionicons name="time" size={14} color={colors.gray[600]} />
              <Text style={styles.metaText}>
                {exercise.estimated_duration}min
              </Text>
            </View>
          )}
        </View>

        {/* Equipment */}
        <View style={styles.equipmentContainer}>
          <Ionicons 
            name={exercise.equipment === 'bodyweight' ? 'person' : 'barbell'} 
            size={12} 
            color={colors.gray[600]} 
          />
          <Text style={styles.equipmentText}>
            {exercise.equipment.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(exercise)}
              accessibilityLabel="Edit exercise"
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(exercise)}
              accessibilityLabel="Delete exercise"
            >
              <Ionicons name="trash" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <View style={styles.selectionIndicator}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
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
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}08`, // Very light blue tint
  } as ViewStyle,

  compactContainer: {
    padding: 8,
    marginVertical: 4,
  } as ViewStyle,

  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  } as ViewStyle,

  image: {
    borderRadius: 8,
  } as ImageStyle,

  placeholderImage: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  } as ViewStyle,

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  } as ViewStyle,

  title: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  } as TextStyle,

  compactTitle: {
    fontSize: 16,
    lineHeight: 20,
  } as TextStyle,

  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  } as TextStyle,

  description: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginBottom: 8,
  } as TextStyle,

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  } as ViewStyle,

  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  } as ViewStyle,

  duration: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  metaText: {
    ...typography.caption,
    color: colors.gray[600],
    marginLeft: 4,
  } as TextStyle,

  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  equipmentText: {
    ...typography.caption,
    color: colors.gray[600],
    marginLeft: 4,
    textTransform: 'capitalize',
  } as TextStyle,

  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginLeft: 8,
  } as ViewStyle,

  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.gray[50],
    marginVertical: 2,
  } as ViewStyle,

  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Cross-platform shadow/box-shadow
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }
    ),
    elevation: 2,
  } as ViewStyle,
});