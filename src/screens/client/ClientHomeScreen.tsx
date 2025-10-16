import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockClientData } from '../../data/mockData';
import { FEATURES } from '../../config/features';
import { useAuth } from '../../context/AuthContext';

interface ClientHomeScreenProps {
  navigation?: any;
}

export const ClientHomeScreen: React.FC<ClientHomeScreenProps> = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const { welcomeMessage, trainerName, currentProgram, upcomingSessions, unreadMessages, recentProgress } = mockClientData;

  const handleBookSession = () => {
    // Navigate to Sessions tab, then to BookSession screen
    if (navigation) {
      navigation.navigate('Sessions', {
        screen: 'BookSession'
      });
    } else {
      console.log('Book session pressed');
    }
  };

  const handleViewSchedule = () => {
    // Navigate to Sessions tab, then to ClientSchedule screen
    if (navigation) {
      navigation.navigate('Sessions', {
        screen: 'ClientSchedule'
      });
    } else {
      console.log('View schedule pressed');
    }
  };

  const handleViewProgram = () => {
    // TODO: Navigate to program details
    console.log('View program pressed');
  };

  const handleViewMessages = () => {
    // TODO: Navigate to messages
    console.log('View messages pressed');
  };

  const handleTrackProgress = () => {
    // TODO: Navigate to progress tracking
    console.log('Track progress pressed');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>{welcomeMessage}</Text>
        {trainerName && (
          <Text style={styles.trainerText}>Your trainer: {trainerName}</Text>
        )}
      </View>

      {/* Current Program */}
      <SectionHeader title="My Fitness Journey" />
      <DashboardCard
        title={currentProgram.name}
        subtitle={`${currentProgram.progress}% complete • Week ${recentProgress.currentWeek} of ${recentProgress.totalWeeks}`}
        icon="🎯"
        onPress={handleViewProgram}
      >
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Next session: {currentProgram.nextSession}
          </Text>
          <Text style={styles.workoutsText}>
            {recentProgress.workoutsCompleted} workouts completed
          </Text>
        </View>
      </DashboardCard>

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      
      {/* Book Session */}
      <DashboardCard
        title="Book a Session"
        subtitle="Schedule your next workout with a trainer"
        icon="📅"
        onPress={handleBookSession}
      />

      {/* View Schedule */}
      <DashboardCard
        title="My Schedule"
        subtitle="View and manage your upcoming sessions"
        icon="🗓️"
        onPress={handleViewSchedule}
      />

      {/* Messages */}
      {FEATURES.MESSAGING_ENABLED && (
        <DashboardCard
          title="Messages"
          subtitle={unreadMessages > 0 ? `${unreadMessages} unread messages` : "No new messages"}
          icon="💬"
          onPress={handleViewMessages}
        />
      )}

      {/* Track Progress */}
      <DashboardCard
        title="Track Progress"
        subtitle="View your fitness metrics and achievements"
        icon="📊"
        onPress={handleTrackProgress}
      />

      {/* Upcoming Sessions */}
      <SectionHeader title="Upcoming Sessions" />
      {upcomingSessions.map((session) => (
        <DashboardCard
          key={session.id}
          title={session.title}
          subtitle={`${session.date} at ${session.time}`}
          icon="🏋️‍♀️"
        >
          <Text style={styles.sessionTrainer}>with {session.trainer}</Text>
        </DashboardCard>
      ))}

      {/* Footer with Sign Out */}
      <View style={styles.footer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  trainerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressContainer: {
    gap: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  workoutsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sessionTrainer: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 32,
    paddingBottom: 16,
  },
});