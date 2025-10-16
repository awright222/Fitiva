import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardCard, SectionHeader, Button } from '../../components/ui';
import { mockAdminData } from '../../data/mockData';
import { FEATURES } from '../../config/features';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export const AdminHomeScreen: React.FC = () => {
  const { signOut, user } = useAuth();
  const { systemOverview, organizations, recentActivity, integrations } = mockAdminData;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return COLORS.success;
      case 'pending': return '#F59E0B'; // amber
      case 'not_connected': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Platform Management & Analytics</Text>
        </View>

        {/* System Overview */}
        <SectionHeader 
          title="System Overview" 
        />
        <View style={styles.row}>
          <DashboardCard
            title="Organizations"
            subtitle={`${systemOverview.totalOrganizations} active`}
            icon="🏢"
            onPress={() => console.log('View organizations')}
          />
          <DashboardCard
            title="Total Users"
            subtitle={systemOverview.totalUsers.toLocaleString()}
            icon="👥"
            onPress={() => console.log('View users')}
          />
        </View>
        <View style={styles.row}>
          <DashboardCard
            title="Subscriptions"
            subtitle={`${systemOverview.activeSubscriptions} active`}
            icon="📋"
            onPress={() => console.log('View subscriptions')}
          />
          <DashboardCard
            title="Monthly Revenue"
            subtitle={`$${(systemOverview.monthlyRevenue / 1000).toFixed(0)}K`}
            icon="💰"
            onPress={() => console.log('View revenue')}
          />
        </View>

        {/* Top Organizations */}
        <SectionHeader 
          title="Top Organizations" 
          actionText="View All"
          onActionPress={() => console.log('View all organizations')}
        />
        {organizations.slice(0, 3).map((org) => (
          <DashboardCard
            key={org.id}
            title={org.name}
            subtitle={`${org.trainers} trainers • ${org.clients} clients • $${(org.revenue / 1000).toFixed(0)}K revenue`}
            icon="🏆"
            onPress={() => console.log(`View ${org.name} details`)}
          />
        ))}

        {/* System Integrations */}
        <SectionHeader 
          title="System Integrations" 
          actionText="Manage"
          onActionPress={() => console.log('Manage integrations')}
        />
        {integrations.map((integration, index) => (
          <DashboardCard
            key={index}
            title={integration.name}
            subtitle={integration.description}
            icon={integration.status === 'connected' ? '✅' : integration.status === 'pending' ? '⏳' : '❌'}
            onPress={() => console.log(`Configure ${integration.name}`)}
          />
        ))}

        {/* Recent Activity */}
        <SectionHeader 
          title="Recent Platform Activity" 
          actionText="View Logs"
          onActionPress={() => console.log('View activity logs')}
        />
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityContent}>
              <Text style={styles.activityMessage}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}

        {/* Admin Actions */}
        <SectionHeader 
          title="Administrative Actions" 
        />
        <View style={styles.row}>
          <DashboardCard
            title="User Management"
            subtitle="Manage all users"
            icon="⚙️"
            onPress={() => console.log('User management')}
          />
          <DashboardCard
            title="Support Center"
            subtitle="Handle support tickets"
            icon="🎧"
            onPress={() => console.log('Support center')}
          />
        </View>
        <View style={styles.row}>
          <DashboardCard
            title="Platform Settings"
            subtitle="Configure platform"
            icon="🔧"
            onPress={() => console.log('Platform settings')}
          />
          <DashboardCard
            title="Analytics"
            subtitle="Advanced reporting"
            icon="📊"
            onPress={() => console.log('Analytics')}
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  signOutContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});