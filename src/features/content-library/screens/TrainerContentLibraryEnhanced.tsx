/**
 * Enhanced Trainer Content Library Screen
 * 
 * Main screen for trainers to manage their exercise library with tabs:
 * - My Exercises: Trainer's own uploaded exercises
 * - Org Library: Organization-level exercises (if WHITE_LABEL enabled)
 * - Global Library: Admin-created global exercises
 * 
 * Features:
 * - Tabbed interface for different exercise scopes
 * - Upload new exercises with thumbnails/videos
 * - Edit and delete own exercises
 * - Filter and search within each scope
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
  Modal,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ExerciseCard } from '../components';
import { ExerciseModal } from '../components/ExerciseModal';
import { SectionHeader, Button } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { FEATURES, canAccessOrgContent } from '../../../config/features';
import type { Exercise, ExerciseFilters } from '../../../types';
import type { Program } from '../../../types';
import { 
  getExercisesByScope, 
  createExerciseWithMedia, 
  deleteExercise,
  deleteStorageFile,
  getPrograms,
  updateProgram,
  deleteProgram,
  getProgramAssignments
} from '../../../services/content-library';
import { TrainerProgramsStackParamList } from '../../../navigation/types';

type TrainerContentLibraryScreenNavigationProp = StackNavigationProp<TrainerProgramsStackParamList, 'ContentLibrary'>;

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#10b981',
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
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
} as const;

type TabType = 'programs' | 'my' | 'org' | 'global';

interface TabInfo {
  key: TabType;
  title: string;
  icon: string;
  enabled: boolean;
}

export const TrainerContentLibraryEnhanced: React.FC = () => {
  const navigation = useNavigation<TrainerContentLibraryScreenNavigationProp>();
  const { user } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('programs');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Define available tabs
  const tabs: TabInfo[] = [
    {
      key: 'programs' as TabType,
      title: 'My Programs',
      icon: 'fitness',
      enabled: true,
    },
    {
      key: 'my' as TabType,
      title: 'My Exercises',
      icon: 'person',
      enabled: true,
    },
    {
      key: 'org' as TabType,
      title: 'Org Library',
      icon: 'business',
      enabled: canAccessOrgContent(),
    },
    {
      key: 'global' as TabType,
      title: 'Global Library',
      icon: 'globe',
      enabled: FEATURES.GLOBAL_EXERCISES_ENABLED,
    },
  ].filter(tab => tab.enabled);

  // Load data when tab or filters change
  useEffect(() => {
    loadData();
  }, [activeTab, filters, user?.id]);

  // Reload data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      console.log('TrainerContentLibraryEnhanced focused - reloading data');
      loadData();
    }, [activeTab, filters])
  );

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'programs') {
        console.log('Loading programs...');
        const { programs: data } = await getPrograms();
        setPrograms(data);
        console.log(`Loaded ${data.length} programs`);
      } else {
        console.log(`Loading exercises for scope: ${activeTab}`);
        const { exercises: data } = await getExercisesByScope(activeTab as 'my' | 'org' | 'global', filters);
        setExercises(data);
        console.log(`Loaded ${data.length} exercises for ${activeTab} scope`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    if (activeTab !== 'my') {
      Alert.alert('Error', 'You can only delete your own exercises.');
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
              // Delete associated media files
              if (exercise.thumbnail_url) {
                await deleteStorageFile('exercise-thumbnails', exercise.thumbnail_url);
              }
              if (exercise.video_url) {
                await deleteStorageFile('exercise-videos', exercise.video_url);
              }
              
              // Delete exercise record
              await deleteExercise(exercise.id);
              
              // Reload exercises
              await loadData();
              
              Alert.alert('Success', 'Exercise deleted successfully.');
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditExercise = (exercise: Exercise) => {
    if (activeTab !== 'my') {
      Alert.alert('Error', 'You can only edit your own exercises.');
      return;
    }

    setEditingExercise(exercise);
    setShowEditModal(true);
  };

  const handleDeleteProgram = async (program: Program) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProgram(program.id);
              await loadData(); // Refresh list
              Alert.alert('Success', 'Program deleted successfully');
            } catch (error) {
              console.error('Error deleting program:', error);
              Alert.alert('Error', 'Failed to delete program. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.gray[600]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => {
    const messages = {
      my: {
        title: 'No exercises yet',
        subtitle: 'Create your first exercise to get started',
        action: 'Add Exercise',
      },
      org: {
        title: 'No org exercises',
        subtitle: 'Your organization hasn\'t shared any exercises yet',
        action: null,
      },
      global: {
        title: 'No global exercises',
        subtitle: 'Global exercises will appear here when available',
        action: null,
      },
      programs: {
        title: 'No programs yet',
        subtitle: 'Create your first program to get started',
        action: 'Create Program',
      },
    };

    const message = messages[activeTab];

    return (
      <View style={styles.emptyState}>
        <Ionicons name="fitness" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyStateTitle}>{message.title}</Text>
        <Text style={styles.emptyStateSubtitle}>{message.subtitle}</Text>
        {message.action && (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => {
              if (activeTab === 'programs') {
                navigation.navigate('ProgramBuilder', { mode: 'create' });
              } else {
                setShowAddModal(true);
              }
            }}
          >
            <Text style={styles.emptyStateButtonText}>{message.action}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => {
        // TODO: Navigate to exercise detail view
        console.log('Exercise pressed:', item.title);
      }}
      onEdit={activeTab === 'my' ? () => handleEditExercise(item) : undefined}
      onDelete={activeTab === 'my' ? () => handleDeleteExercise(item) : undefined}
      showActions={activeTab === 'my'} // Show edit/delete buttons only for user's own exercises
    />
  );

  const renderProgramItem = ({ item }: { item: Program }) => (
    <View style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{item.title}</Text>
          <Text style={styles.programDescription}>{item.description}</Text>
          <Text style={styles.programMeta}>
            {item.program_days?.length || 0} days • Duration: {item.duration_weeks} weeks
          </Text>
        </View>
        <View style={styles.programActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('ProgramBuilder', { mode: 'edit', program: item })}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProgram(item)}
          >
            <Ionicons name="trash" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.programFooter}>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => {
            // TODO: Navigate to assignment screen
            console.log('Assign program:', item.title);
          }}
        >
          <Ionicons name="people" size={18} color={colors.white} />
          <Text style={styles.assignButtonText}>Assign to Clients</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!FEATURES.CONTENT_LIBRARY_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledState}>
          <Ionicons name="construct" size={64} color={colors.gray[400]} />
          <Text style={styles.disabledTitle}>Content Library Disabled</Text>
          <Text style={styles.disabledSubtitle}>
            This feature is currently disabled. Contact your administrator for access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SectionHeader title="Content Library" />
        {(activeTab === 'my' || activeTab === 'programs') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (activeTab === 'programs') {
                navigation.navigate('ProgramBuilder', { mode: 'create' });
              } else {
                setShowAddModal(true);
              }
            }}
          >
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={styles.addButtonText}>
              {activeTab === 'programs' ? 'Create Program' : 'Add Exercise'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Loading {activeTab === 'programs' ? 'programs' : 'exercises'}...
          </Text>
        </View>
      ) : activeTab === 'programs' ? (
        programs.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={programs}
            renderItem={renderProgramItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.exerciseList}
            contentContainerStyle={styles.exerciseListContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : exercises.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.exerciseList}
          contentContainerStyle={styles.exerciseListContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Exercise Modal */}
      <ExerciseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadData(); // Refresh the list
        }}
      />

      {/* Edit Exercise Modal */}
      <ExerciseModal
        visible={showEditModal}
        exercise={editingExercise || undefined}
        onClose={() => {
          setShowEditModal(false);
          setEditingExercise(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setEditingExercise(null);
          loadData(); // Refresh the list
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,

  addButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: 8,
    fontWeight: '600',
  } as TextStyle,

  tabBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  } as ViewStyle,

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  } as ViewStyle,

  activeTab: {
    borderBottomColor: colors.primary,
  } as ViewStyle,

  tabText: {
    ...typography.body,
    color: colors.gray[600],
    marginLeft: 8,
  } as TextStyle,

  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,

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
  } as TextStyle,

  exerciseList: {
    flex: 1,
  } as ViewStyle,

  exerciseListContent: {
    padding: 20,
  } as ViewStyle,

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

  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  } as ViewStyle,

  emptyStateButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
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

  // Program card styles
  programCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,

  programInfo: {
    flex: 1,
    marginRight: 16,
  } as ViewStyle,

  programTitle: {
    ...typography.h2,
    color: colors.gray[900],
    marginBottom: 8,
  } as TextStyle,

  programDescription: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: 8,
  } as TextStyle,

  programMeta: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: '500',
  } as TextStyle,

  programActions: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  } as ViewStyle,

  editButton: {
    backgroundColor: colors.blue[50],
    borderColor: colors.primary,
  } as ViewStyle,

  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: colors.danger,
  } as ViewStyle,

  programFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  } as ViewStyle,

  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  } as ViewStyle,

  assignButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  } as TextStyle,
});

export default TrainerContentLibraryEnhanced;