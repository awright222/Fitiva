import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockOrgData } from '../../data/mockData';
import { FEATURES } from '../../config/features';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export const OrgHomeScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { organization, trainers, clients, sessions, revenue, topTrainers } = mockOrgData;

  const handleTrainerManagement = () => {
    // TODO: Navigate to trainer management screen
    console.log('Navigate to trainer management');
  };

  const handleClientOverview = () => {
    // TODO: Navigate to client overview
    console.log('Navigate to client overview');
  };

  const handleAnalytics = () => {
    // TODO: Navigate to analytics dashboard
    console.log('Navigate to analytics');
  };

  const handleSettings = () => {
    // TODO: Navigate to organization settings
    console.log('Navigate to settings');
  };

  const handleInviteTrainer = () => {
    // TODO: Navigate to invite trainer flow
    console.log('Navigate to invite trainer');
  };

  const handleViewReports = () => {
    // TODO: Navigate to detailed reports
    console.log('Navigate to reports');
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
        {/* Organization Header */}
        <View style={styles.header}>
          <Text style={styles.orgIcon}>{organization.logo}</Text>
          <Text style={styles.welcomeText}>{organization.name}</Text>
          <Text style={styles.subtitleText}>{organization.location}</Text>
        </View>

        {/* Trainer Overview Section */}
        <SectionHeader 
          title="Trainer Overview" 
          actionText="Manage All"
          onActionPress={handleTrainerManagement}
        />
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Total Trainers"
            subtitle={`${trainers.total} (${trainers.active} active)`}
            icon="👨‍🏫"
            onPress={handleTrainerManagement}
          />
          <DashboardCard
            title="New This Month"
            subtitle={`${trainers.newThisMonth} trainers joined`}
            icon="✨"
            onPress={handleTrainerManagement}
          />
        </View>

        {/* Client Overview Section */}
        <SectionHeader 
          title="Client Overview" 
          actionText="View Details"
          onActionPress={handleClientOverview}
        />
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Active Clients"
            subtitle={`${clients.active} of ${clients.total} total`}
            icon="👥"
            onPress={handleClientOverview}
          />
          <DashboardCard
            title="Growth Rate"
            subtitle={`${clients.newThisMonth} new this month`}
            icon="📈"
            onPress={handleClientOverview}
          />
          <DashboardCard
            title="Retention"
            subtitle={`${(100 - clients.churnRate).toFixed(1)}% retention rate`}
            icon="🎯"
            onPress={handleClientOverview}
          />
        </View>

        {/* Analytics Snapshot Section */}
        {FEATURES.ANALYTICS_ENABLED && (
          <>
            <SectionHeader 
              title="Analytics Snapshot" 
              actionText="View Reports"
              onActionPress={handleAnalytics}
            />
            <View style={styles.cardsContainer}>
              <DashboardCard
                title="Today's Sessions"
                subtitle={`${sessions.today} scheduled`}
                icon="📅"
                onPress={handleAnalytics}
              />
              <DashboardCard
                title="Completion Rate"
                subtitle={`${sessions.completionRate}% this week`}
                icon="✅"
                onPress={handleAnalytics}
              />
              <DashboardCard
                title="Revenue"
                subtitle={`$${revenue.thisMonth.toLocaleString()} (+${revenue.growth}%)`}
                icon="💰"
                onPress={handleAnalytics}
              />
            </View>
          </>
        )}

        {/* Top Trainers Section */}
        <SectionHeader 
          title="Top Performers" 
          actionText="View All"
          onActionPress={handleTrainerManagement}
        />
        <View style={styles.cardsContainer}>
          {topTrainers.map((trainer) => (
            <DashboardCard
              key={trainer.id}
              title={trainer.name}
              subtitle={`${trainer.clients} clients • $${trainer.revenue.toLocaleString()}`}
              icon="⭐"
              onPress={handleTrainerManagement}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Invite New Trainer"
            onPress={handleInviteTrainer}
            disabled={!FEATURES.WHITE_LABEL_ENABLED}
            style={styles.primaryButton}
          />
          <Button
            title="Organization Settings"
            onPress={handleSettings}
            variant="outline"
            style={styles.secondaryButton}
          />
          {FEATURES.ANALYTICS_ENABLED && (
            <Button
              title="View Detailed Reports"
              onPress={handleViewReports}
              variant="outline"
              style={styles.secondaryButton}
            />
          )}
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
    alignItems: 'center',
  },
  orgIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
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