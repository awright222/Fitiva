import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockClientData } from '../../data/mockData';
import { FEATURES } from '../../config/features';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';

interface ClientHomeScreenProps {
  navigation?: any;
}

export const ClientHomeScreen: React.FC<ClientHomeScreenProps> = ({ navigation }) => {
  const { signOut, user } = useAuth();
  const { welcomeMessage, trainerName, currentProgram, upcomingSessions, unreadMessages, recentProgress } = mockClientData;

  const handleBookSession = () => {
    // TODO: FEATURE FLAG INTEGRATION - Check if booking is enabled
    if (!FEATURES.SESSION_BOOKING) {
      Alert.alert(
        'Feature Coming Soon',
        'Session booking will be available in a future update. Please contact your trainer directly to schedule sessions.'
      );
      return;
    }

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
    // Navigate to Messages tab
    navigation.navigate('Messages');
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section with Trainer */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{welcomeMessage}</Text>
          {trainerName && (
            <View style={styles.trainerInfo}>
              <View style={styles.trainerAvatar}>
                <Text style={styles.avatarText}>SM</Text>
              </View>
              <View style={styles.trainerDetails}>
                <Text style={styles.trainerName}>{trainerName}</Text>
                <Text style={styles.trainerRole}>Your Personal Trainer</Text>
              </View>
              <TouchableOpacity style={styles.messageButton} onPress={handleViewMessages}>
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  trainerRole: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  messageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    gap: 4,
  },
  progressText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  workoutsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sessionTrainer: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 32,
    paddingBottom: 16,
  },
});