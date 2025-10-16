import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { UserRole } from '../../types';
import { USER_ROLES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth';

interface RoleSelectionScreenProps {
  navigation: any;
  route: {
    params?: {
      signUpData?: {
        email: string;
        password: string;
        name: string;
        date_of_birth?: string;
      };
    };
  };
}

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

const roleOptions: RoleOption[] = [
  {
    role: 'client',
    title: 'Client',
    description: 'I want to work with a trainer to improve my fitness',
    icon: '🏃‍♀️',
    benefits: [
      'Access to certified trainers',
      'Personalized workout programs',
      'Progress tracking and analytics',
      'Flexible scheduling',
    ],
  },
  {
    role: 'trainer',
    title: 'Trainer',
    description: 'I am a fitness professional who wants to help clients',
    icon: '💪',
    benefits: [
      'Connect with new clients',
      'Create and manage programs',
      'Track client progress',
      'Flexible scheduling tools',
    ],
  },
  {
    role: 'org_manager',
    title: 'Organization Manager',
    description: 'I manage a fitness organization or gym',
    icon: '🏢',
    benefits: [
      'Manage trainers and clients',
      'Organization-wide analytics',
      'Branded experience',
      'Administrative tools',
    ],
  },
];

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, updateProfile, signUp } = useAuth();
  const signUpData = route.params?.signUpData;

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      Alert.alert('Selection Required', 'Please select your role to continue.');
      return;
    }

    setIsLoading(true);
    try {
      if (signUpData) {
        // New user signup - create account with selected role
        const completeSignUpData = {
          ...signUpData,
          role: selectedRole,
        };

        await signUp(completeSignUpData);
        
        Alert.alert(
          'Account Created',
          `Welcome to Fitiva as a ${USER_ROLES[selectedRole]}!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigation will be handled by AuthContext based on role
                // The app will automatically navigate to the appropriate home screen
              },
            },
          ]
        );
      } else {
        // Existing user - update role
        if (!user) {
          Alert.alert('Error', 'No user session found. Please sign in again.');
          navigation.navigate('Login');
          return;
        }

        await updateProfile({ role: selectedRole });
        
        Alert.alert(
          'Role Updated',
          `Your role has been updated to ${USER_ROLES[selectedRole]}!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigation will be handled by AuthContext based on role
              },
            },
          ]
        );
      }
      
    } catch (error: any) {
      console.error('Role selection error:', error);
      
      let errorMessage = signUpData 
        ? 'Failed to create your account. Please try again.'
        : 'Failed to update your role. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert(signUpData ? 'Sign Up Error' : 'Update Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleCard: React.FC<{ option: RoleOption }> = ({ option }) => {
    const isSelected = selectedRole === option.role;
    
    return (
      <TouchableOpacity
        style={[
          styles.roleCard,
          isSelected && styles.roleCardSelected,
        ]}
        onPress={() => setSelectedRole(option.role)}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${option.title}: ${option.description}`}
      >
        <View style={styles.roleHeader}>
          <Text style={styles.roleIcon}>{option.icon}</Text>
          <View style={styles.roleTitleContainer}>
            <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
              {option.title}
            </Text>
            <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
              {isSelected && <View style={styles.radioButtonInner} />}
            </View>
          </View>
        </View>
        
        <Text style={[styles.roleDescription, isSelected && styles.roleDescriptionSelected]}>
          {option.description}
        </Text>
        
        <View style={styles.benefitsList}>
          {option.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={[styles.benefitText, isSelected && styles.benefitTextSelected]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'll be using Fitiva to get the best experience
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roleOptions.map((option) => (
            <RoleCard key={option.role} option={option} />
          ))}
        </View>

        <Button
          title={signUpData ? "Create Account" : "Update Role"}
          onPress={handleRoleSelection}
          loading={isLoading}
          disabled={!selectedRole}
          style={styles.continueButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change your role later in account settings
          </Text>
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
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  rolesContainer: {
    marginBottom: SPACING.xl,
  },
  
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05', // 5% opacity
  },
  
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  roleIcon: {
    fontSize: FONT_SIZES['3xl'],
    marginRight: SPACING.md,
  },
  
  roleTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  roleTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  
  roleTitleSelected: {
    color: COLORS.primary,
  },
  
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  
  roleDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  
  roleDescriptionSelected: {
    color: COLORS.text.primary,
  },
  
  benefitsList: {
    marginTop: SPACING.sm,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  
  benefitBullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  
  benefitTextSelected: {
    color: COLORS.text.primary,
  },
  
  continueButton: {
    marginBottom: SPACING.lg,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});