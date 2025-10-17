import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockTrainerData } from '../../data/mockData';
import { getConversations } from '../../features/messaging/data/mockData';
import { FEATURES } from '../../config/features';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface TrainerHomeScreenProps {
  navigation?: any;
}

export const TrainerHomeScreen: React.FC<TrainerHomeScreenProps> = ({ navigation }) => {
  const { signOut, userProfile } = useAuth();
  const { profile, clients, todaySessions, earnings } = mockTrainerData;
  
  // Helper function to get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };
  
  // Get real recent messages from messaging system
  const trainerId = '2'; // Force to '2' for demo to match mock data
  const conversations = getConversations(trainerId);
  const recentMessages = conversations.slice(0, 2).map(conv => ({
    id: conv.id,
    clientName: conv.participant_name,
    message: conv.last_message.content.length > 50 
      ? conv.last_message.content.substring(0, 50) + '...'
      : conv.last_message.content,
    time: getRelativeTime(conv.last_message.created_at),
  }));

  const handleClientManagement = () => {
    // Navigate to Clients tab
    if (navigation) {
      navigation.navigate('Clients');
    } else {
      console.log('Navigate to client management');
    }
  };

  const handleScheduleManagement = () => {
    // Navigate to Schedule tab, then to TrainerSchedule screen
    if (navigation) {
      navigation.navigate('Schedule', {
        screen: 'TrainerSchedule'
      });
    } else {
      console.log('Navigate to schedule management');
    }
  };

  const handleMessaging = () => {
    // Navigate to Messages tab
    navigation.navigate('Messages');
  };

  const handleEarnings = () => {
    // TODO: Navigate to earnings/analytics
    console.log('Navigate to earnings');
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {userProfile?.full_name || 'Trainer'}!</Text>
          <Text style={styles.subtitleText}>
            {profile.specialties.join(' • ')} • {profile.totalClients} Active Clients
          </Text>
        </View>

        {/* My Clients Section */}
        <SectionHeader 
          title="My Clients" 
          actionText="View All"
          onActionPress={handleClientManagement}
        />
        <View style={styles.cardsContainer}>
          {clients.slice(0, 3).map((client) => (
            <DashboardCard
              key={client.id}
              title={client.full_name}
              subtitle={client.session_stats.next_session 
                ? `Next: ${new Date(client.session_stats.next_session).toLocaleDateString()}` 
                : 'No upcoming sessions'}
              icon="👤"
              onPress={handleClientManagement}
            />
          ))}
        </View>

        {/* Today's Sessions Section */}
        <SectionHeader 
          title="Today's Sessions" 
          actionText="Manage Schedule"
          onActionPress={handleScheduleManagement}
        />
        <View style={styles.cardsContainer}>
          {todaySessions.map((session) => (
            <DashboardCard
              key={session.id}
              title={`${session.time} - ${session.clientName}`}
              subtitle={session.type}
              icon={session.status === 'completed' ? '✅' : '📅'}
              onPress={handleScheduleManagement}
            />
          ))}
        </View>

        {/* Messages Section */}
        {FEATURES.MESSAGING_ENABLED && (
          <>
            <SectionHeader 
              title="Recent Messages" 
              actionText="View All"
              onActionPress={handleMessaging}
            />
            <View style={styles.cardsContainer}>
              {recentMessages.map((message) => (
                <DashboardCard
                  key={message.id}
                  title={message.clientName}
                  subtitle={message.message}
                  icon="💬"
                  onPress={handleMessaging}
                />
              ))}
            </View>
          </>
        )}

        {/* Earnings Overview Section */}
        <SectionHeader 
          title="Earnings Overview" 
          actionText="View Details"
          onActionPress={handleEarnings}
        />
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="This Month"
            subtitle={`$${earnings.thisMonth.toLocaleString()}`}
            icon="💰"
            onPress={handleEarnings}
          />
          <DashboardCard
            title="This Week"
            subtitle={`$${earnings.thisWeek.toLocaleString()}`}
            icon="📊"
            onPress={handleEarnings}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Manage Schedule"
            onPress={handleScheduleManagement}
            style={styles.primaryButton}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
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
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 12,
  },
  signOutContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});