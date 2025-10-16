import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockTrainerData } from '../../data/mockData';
import { FEATURES } from '../../config/features';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface TrainerHomeScreenProps {
  navigation?: any;
}

export const TrainerHomeScreen: React.FC<TrainerHomeScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const { profile, clients, todaySessions, recentMessages, earnings } = mockTrainerData;

  const handleClientManagement = () => {
    // TODO: Navigate to client management screen
    console.log('Navigate to client management');
  };

  const handleScheduleManagement = () => {
    // Navigate to trainer schedule screen
    if (navigation) {
      navigation.navigate('TrainerSchedule');
    } else {
      console.log('Navigate to schedule management');
    }
  };

  const handleMessaging = () => {
    // TODO: Navigate to messaging
    console.log('Navigate to messaging');
  };

  const handleEarnings = () => {
    // TODO: Navigate to earnings/analytics
    console.log('Navigate to earnings');
  };

  const handleAddProgram = () => {
    // TODO: Navigate to program creation
    console.log('Navigate to program creation');
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
          <Text style={styles.welcomeText}>Welcome back, {profile.name}!</Text>
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
              title={client.name}
              subtitle={`Next: ${client.nextSession}`}
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
            title="Add New Program"
            onPress={handleAddProgram}
            style={styles.primaryButton}
          />
          <Button
            title="Manage Schedule"
            onPress={handleScheduleManagement}
            variant="outline"
            style={styles.secondaryButton}
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
  secondaryButton: {
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