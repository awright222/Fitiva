import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ProgramDayCard } from '../../components/ProgramDayCard';
import {
  getClientPrograms,
  updateClientProgramProgress,
  calculateProgramCompletion,
  type ClientProgramWithDetails,
} from '../../services/client-programs';
import type { ProgramDay } from '../../types';

export const ClientProgramScreen: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ClientProgramWithDetails[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ClientProgramWithDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrograms = async () => {
    if (!user?.id) return;

    try {
      const clientPrograms = await getClientPrograms(user.id);
      setPrograms(clientPrograms);

      // Auto-select the first active program
      if (clientPrograms.length > 0 && !selectedProgram) {
        const activeProgram = clientPrograms.find(p => p.is_active) || clientPrograms[0];
        setSelectedProgram(activeProgram);
        
        // Auto-select current day or first day
        if (activeProgram.program.program_days?.length > 0) {
          const currentDayNumber = activeProgram.current_day || 1;
          const currentDay = activeProgram.program.program_days.find(
            day => day.day_number === currentDayNumber
          ) || activeProgram.program.program_days[0];
          setSelectedDay(currentDay);
        }
      }
    } catch (error) {
      console.error('Error loading client programs:', error);
      Alert.alert('Error', 'Failed to load your programs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPrograms();
  };

  const handleExerciseComplete = async () => {
    if (!selectedProgram) return;

    try {
      // Recalculate completion percentage
      const newPercentage = await calculateProgramCompletion(selectedProgram.id);
      
      // Update program progress
      await updateClientProgramProgress(selectedProgram.id, {
        completion_percentage: newPercentage,
      });

      // Update local state
      setPrograms(prev =>
        prev.map(program =>
          program.id === selectedProgram.id
            ? { ...program, completion_percentage: newPercentage }
            : program
        )
      );

      setSelectedProgram(prev =>
        prev ? { ...prev, completion_percentage: newPercentage } : null
      );
    } catch (error) {
      console.error('Error updating program progress:', error);
    }
  };

  const getDayCompletionColor = (dayNumber: number) => {
    if (!selectedProgram) return '#E5E5E5';
    
    const currentDay = selectedProgram.current_day || 1;
    if (dayNumber < currentDay) return '#4CAF50'; // Completed
    if (dayNumber === currentDay) return '#007AFF'; // Current
    return '#E5E5E5'; // Future
  };

  const formatDayTitle = (day: ProgramDay) => {
    return day.name || `Day ${day.day_number}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (programs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Ionicons name="fitness-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Programs Assigned</Text>
          <Text style={styles.emptyText}>
            Your trainer hasn't assigned you a program yet. Check back later or contact your trainer.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!selectedProgram || !selectedDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting up your program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Program Header */}
      <View style={styles.header}>
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{selectedProgram.program.title}</Text>
          <Text style={styles.programMeta}>
            {selectedProgram.program.duration_weeks} weeks • {selectedProgram.program.difficulty}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${selectedProgram.completion_percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {selectedProgram.completion_percentage}% Complete
            </Text>
          </View>
        </View>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayList}>
          {selectedProgram.program.program_days?.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDay.id === day.id && styles.selectedDayButton,
                { borderColor: getDayCompletionColor(day.day_number) }
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayButtonNumber,
                selectedDay.id === day.id && styles.selectedDayButtonText
              ]}>
                {day.day_number}
              </Text>
              <Text style={[
                styles.dayButtonTitle,
                selectedDay.id === day.id && styles.selectedDayButtonText
              ]} numberOfLines={1}>
                {formatDayTitle(day)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Program Day Content */}
      <ProgramDayCard
        programDay={selectedDay}
        clientProgramId={selectedProgram.id}
        onExerciseComplete={handleExerciseComplete}
      />
    </SafeAreaView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  programInfo: {
    gap: 8,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  programMeta: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  daySelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dayList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dayButtonTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedDayButtonText: {
    color: '#FFFFFF',
  },
});