/**
 * Exercise Filter Component
 * 
 * Provides filtering and search functionality for exercise libraries.
 * Includes search bar, difficulty filters, muscle group selection,
 * equipment filters, and category selection.
 * 
 * Features:
 * - Large, accessible filter buttons for seniors
 * - Clear visual feedback for active filters
 * - Search with debouncing
 * - Multi-select filters with clear indicators
 * - Reset all filters functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { ExerciseFilters, MuscleGroup, EquipmentType, DifficultyLevel, ExerciseCategory } from '../types';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS, EXERCISE_CATEGORIES } from '../data/mockData';

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
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
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 18,
  },
} as const;

interface ExerciseFilterProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
  onClose?: () => void;
  showMyExercises?: boolean; // Show "My Exercises" toggle for trainers
  currentUserId?: string;
}

export const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  filters,
  onFiltersChange,
  onClose,
  showMyExercises = false,
  currentUserId,
}) => {
  const [searchText, setSearchText] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchText || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const toggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    const current = filters.muscle_groups || [];
    const updated = current.includes(muscleGroup)
      ? current.filter(mg => mg !== muscleGroup)
      : [...current, muscleGroup];
    
    onFiltersChange({
      ...filters,
      muscle_groups: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleEquipment = (equipment: EquipmentType) => {
    const current = filters.equipment || [];
    const updated = current.includes(equipment)
      ? current.filter(eq => eq !== equipment)
      : [...current, equipment];
    
    onFiltersChange({
      ...filters,
      equipment: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    const current = filters.difficulty || [];
    const updated = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty];
    
    onFiltersChange({
      ...filters,
      difficulty: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleCategory = (category: ExerciseCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    onFiltersChange({
      ...filters,
      category: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleMyExercises = () => {
    onFiltersChange({
      ...filters,
      created_by: filters.created_by ? undefined : currentUserId,
    });
  };

  const clearAllFilters = () => {
    setSearchText('');
    onFiltersChange({});
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.muscle_groups?.length ||
      filters.equipment?.length ||
      filters.difficulty?.length ||
      filters.category?.length ||
      filters.created_by ||
      filters.has_video ||
      filters.has_thumbnail
    );
  };

  const formatMuscleGroupName = (muscleGroup: MuscleGroup): string => {
    return muscleGroup.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatEquipmentName = (equipment: EquipmentType): string => {
    return equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter Exercises</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray[600]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={colors.gray[600]}
              accessibilityLabel="Search exercises"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.gray[600]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* My Exercises Toggle */}
        {showMyExercises && currentUserId && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.toggleButton, filters.created_by ? styles.toggleButtonActive : null]}
              onPress={toggleMyExercises}
            >
              <Ionicons 
                name={filters.created_by ? "checkbox" : "square-outline"} 
                size={20} 
                color={filters.created_by ? colors.primary : colors.gray[600]} 
              />
              <Text style={[styles.toggleText, filters.created_by ? styles.toggleTextActive : null]}>
                My Exercises Only
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={[styles.quickFilter, filters.has_video && styles.quickFilterActive]}
              onPress={() => onFiltersChange({ ...filters, has_video: !filters.has_video })}
            >
              <Ionicons name="videocam" size={16} color={filters.has_video ? colors.white : colors.gray[600]} />
              <Text style={[styles.quickFilterText, filters.has_video && styles.quickFilterTextActive]}>
                Has Video
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickFilter, filters.has_thumbnail && styles.quickFilterActive]}
              onPress={() => onFiltersChange({ ...filters, has_thumbnail: !filters.has_thumbnail })}
            >
              <Ionicons name="image" size={16} color={filters.has_thumbnail ? colors.white : colors.gray[600]} />
              <Text style={[styles.quickFilterText, filters.has_thumbnail && styles.quickFilterTextActive]}>
                Has Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.filterChips}>
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  filters.difficulty?.includes(difficulty) && styles.filterChipActive,
                ]}
                onPress={() => toggleDifficulty(difficulty)}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.difficulty?.includes(difficulty) && styles.filterChipTextActive,
                ]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.filterChips}>
            {EXERCISE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  filters.category?.includes(category) && styles.filterChipActive,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.category?.includes(category) && styles.filterChipTextActive,
                ]}>
                  {category.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Groups</Text>
          <View style={styles.filterChips}>
            {MUSCLE_GROUPS.map((muscleGroup) => (
              <TouchableOpacity
                key={muscleGroup}
                style={[
                  styles.filterChip,
                  filters.muscle_groups?.includes(muscleGroup) && styles.filterChipActive,
                ]}
                onPress={() => toggleMuscleGroup(muscleGroup)}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.muscle_groups?.includes(muscleGroup) && styles.filterChipTextActive,
                ]}>
                  {formatMuscleGroupName(muscleGroup)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.filterChips}>
            {EQUIPMENT_TYPES.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[
                  styles.filterChip,
                  filters.equipment?.includes(equipment) && styles.filterChipActive,
                ]}
                onPress={() => toggleEquipment(equipment)}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.equipment?.includes(equipment) && styles.filterChipTextActive,
                ]}>
                  {formatEquipmentName(equipment)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Ionicons name="refresh" size={20} color={colors.gray[600]} />
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  headerTitle: {
    ...typography.h4,
    color: colors.gray[900],
  } as TextStyle,

  closeButton: {
    padding: 4,
  } as ViewStyle,

  content: {
    flex: 1,
    padding: 16,
  } as ViewStyle,

  section: {
    marginBottom: 24,
  } as ViewStyle,

  sectionTitle: {
    ...typography.h4,
    color: colors.gray[900],
    marginBottom: 12,
  } as TextStyle,

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray[900],
    marginLeft: 8,
    marginRight: 8,
    minHeight: 40,
  } as TextStyle,

  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  toggleButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  } as ViewStyle,

  toggleText: {
    ...typography.body,
    color: colors.gray[700],
    marginLeft: 8,
  } as TextStyle,

  toggleTextActive: {
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,

  quickFilters: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  quickFilterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,

  quickFilterText: {
    ...typography.bodySmall,
    color: colors.gray[700],
    marginLeft: 6,
  } as TextStyle,

  quickFilterTextActive: {
    color: colors.white,
  } as TextStyle,

  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 36,
    justifyContent: 'center',
  } as ViewStyle,

  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,

  filterChipText: {
    ...typography.bodySmall,
    color: colors.gray[700],
    textAlign: 'center',
    textTransform: 'capitalize',
  } as TextStyle,

  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  } as TextStyle,

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,

  clearButtonText: {
    ...typography.body,
    color: colors.gray[700],
    marginLeft: 8,
  } as TextStyle,
});