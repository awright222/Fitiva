import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export const OrgHomeScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organization Dashboard</Text>
      <Text style={styles.subtitle}>Manage your fitness organization</Text>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.email}!
        </Text>
        <Text style={styles.roleText}>
          Organization Manager
        </Text>
        
        <View style={styles.placeholderSection}>
          <Text style={styles.sectionTitle}>Coming Soon:</Text>
          <Text style={styles.featureText}>• Trainer Management</Text>
          <Text style={styles.featureText}>• Client Overview</Text>
          <Text style={styles.featureText}>• Analytics & Reports</Text>
          <Text style={styles.featureText}>• Billing Management</Text>
          <Text style={styles.featureText}>• Organization Settings</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  roleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  placeholderSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
});