import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { isValidEmail, validatePassword, calculateAge } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Date of birth validation (optional but if provided, must be valid)
    if (formData.dateOfBirth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Please enter date in YYYY-MM-DD format';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const age = calculateAge(birthDate);
        if (age < 13) {
          newErrors.dateOfBirth = 'You must be at least 13 years old to sign up';
        } else if (age > 120) {
          newErrors.dateOfBirth = 'Please enter a valid birth date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const signUpData = {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        role: 'client' as UserRole, // Default role, will be updated in role selection
        date_of_birth: formData.dateOfBirth || undefined,
      };

      await signUp(signUpData);
      
      // Navigate to role selection
      navigation.navigate('RoleSelection');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Sign Up Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Join Fitiva</Text>
            <Text style={styles.subtitle}>
              Create your account to start your fitness journey
            </Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              error={errors.name}
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              required
            />

            <InputField
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
            />

            <InputField
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              error={errors.password}
              placeholder="Create a secure password"
              secureTextEntry
              autoComplete="password-new"
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              required
            />

            <InputField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="password-new"
              required
            />

            <InputField
              label="Date of Birth (Optional)"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateField('dateOfBirth', value)}
              error={errors.dateOfBirth}
              placeholder="YYYY-MM-DD (e.g., 1980-12-25)"
              helperText="Helps us personalize your fitness experience"
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={navigateToLogin}>
                Sign In
              </Text>
            </Text>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  
  form: {
    marginBottom: SPACING.lg,
  },
  
  signUpButton: {
    marginTop: SPACING.lg,
  },
  
  footer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  
  loginLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  terms: {
    paddingHorizontal: SPACING.md,
  },
  
  termsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});