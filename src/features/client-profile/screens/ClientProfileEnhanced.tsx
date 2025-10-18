/**
 * ClientProfileEnhanced Screen - Comprehensive client onboarding and profile management
 * 
 * Features:
 * - Personal information (age, height, weight, gender, location)
 * - Fitness goals and training preferences
 * - Health information and medical conditions
 * - Equipment access and activity level
 * - Profile completion tracking
 * - Save/validation functionality
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Profile Data Operations:
 *    - Replace mock with: supabase.from('client_profiles').upsert(profileData)
 *    - Load existing: supabase.from('client_profiles').select().eq('user_id', userId).single()
 * 
 * 2. Real-time Updates:
 *    - Auto-save changes with debouncing
 *    - Progress completion percentage tracking
 * 
 * 3. Validation & Recommendations:
 *    - Validate health information format
 *    - Suggest equipment based on goals (future AI feature)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { SectionHeader } from '../../../components/ui';
import { ClientProfile, TrainingStyle, ActivityLevel, ProgramCategory } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../constants';
import { FEATURES } from '../../../config/features';

// Mock service - TODO: Replace with Supabase
import { getClientProfile, saveClientProfile } from '../services/profileService';

type ClientProfileStackParamList = {
  ClientProfileEnhanced: {
    isOnboarding?: boolean;
  };
};

type ClientProfileEnhancedProps = {
  navigation: StackNavigationProp<ClientProfileStackParamList, 'ClientProfileEnhanced'>;
  route: RouteProp<ClientProfileStackParamList, 'ClientProfileEnhanced'>;
};

const TRAINING_STYLES: { label: string; value: TrainingStyle }[] = [
  { label: 'In-Person Training', value: 'in_person' },
  { label: 'Virtual Sessions', value: 'virtual' },
  { label: 'Self-Guided Programs', value: 'self_guided' },
  { label: 'Any Style', value: 'any' },
];

const ACTIVITY_LEVELS: { label: string; value: ActivityLevel; description: string }[] = [
  { label: 'Low', value: 'low', description: 'Minimal exercise, mostly sedentary' },
  { label: 'Moderate', value: 'moderate', description: 'Some regular activity, 1-3 times/week' },
  { label: 'High', value: 'high', description: 'Very active, 4+ times/week' },
];

const FITNESS_GOALS: { label: string; value: string; category: ProgramCategory }[] = [
  { label: 'Weight Loss', value: 'weight_loss', category: 'weight_loss' },
  { label: 'Muscle Gain', value: 'muscle_gain', category: 'muscle_gain' },
  { label: 'Improve Strength', value: 'strength', category: 'strength' },
  { label: 'Better Mobility', value: 'mobility', category: 'flexibility' },
  { label: 'Cardiovascular Health', value: 'cardio', category: 'cardio' },
  { label: 'Balance & Stability', value: 'balance', category: 'balance' },
  { label: 'Recovery & Wellness', value: 'recovery', category: 'recovery' },
  { label: 'General Fitness', value: 'general_fitness', category: 'general_fitness' },
];

const EQUIPMENT_OPTIONS: string[] = [
  'No Equipment',
  'Dumbbells',
  'Resistance Bands',
  'Yoga Mat',
  'Gym Access',
  'Home Gym Setup',
  'Kettlebells', 
  'Pull-up Bar',
  'Exercise Ball',
  'Foam Roller',
];

export const ClientProfileEnhanced: React.FC<ClientProfileEnhancedProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const { isOnboarding = false } = route.params || {};
  
  const [profile, setProfile] = useState<Partial<ClientProfile>>({
    goals: [],
    preferred_training_style: 'any',
    frequency_per_week: 3,
    activity_level: 'moderate',
    motivation_level: 5,
    equipment_access: [],
    medical_conditions: [],
    discoverable: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('client_profiles')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single();
      
      const existingProfile = await getClientProfile(user.id);
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show error for new profiles
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = useCallback((updates: Partial<ClientProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      const profileData: Partial<ClientProfile> = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      
      // TODO: Replace with Supabase upsert
      // const { error } = await supabase
      //   .from('client_profiles')
      //   .upsert(profileData);
      
      await saveClientProfile(profileData);
      
      setHasChanges(false);
      
      if (isOnboarding) {
        Alert.alert(
          'Profile Complete!',
          'Welcome to Fitiva! Your profile has been saved and you can now browse programs.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('ClientTabs' as any),
            },
          ]
        );
      } else {
        Alert.alert('Profile Saved', 'Your changes have been saved successfully.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletionPercentage = (): number => {
    const fields = [
      profile.age,
      profile.height_cm,
      profile.weight_kg,
      profile.gender,
      profile.location,
      profile.goals?.length,
      profile.preferred_training_style,
      profile.frequency_per_week,
      profile.activity_level,
      profile.equipment_access?.length,
    ];
    
    const completedFields = fields.filter(field => 
      field !== undefined && field !== null && field !== 0
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  const toggleGoal = (goalValue: string) => {
    const currentGoals = profile.goals || [];
    const newGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue];
    
    updateProfile({ goals: newGoals });
  };

  const toggleEquipment = (equipment: string) => {
    const currentEquipment = profile.equipment_access || [];
    const newEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
    
    updateProfile({ equipment_access: newEquipment });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionPercent = calculateCompletionPercentage();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SectionHeader
          title={isOnboarding ? 'Complete Your Profile' : 'Your Profile'}
          subtitle={`${completionPercent}% complete`}
          showBackButton={!isOnboarding}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={profile.age?.toString() || ''}
                  onChangeText={(text) => updateProfile({ age: parseInt(text) || undefined })}
                  placeholder="25"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  style={styles.input}
                  value={profile.gender || ''}
                  onChangeText={(text) => updateProfile({ gender: text })}
                  placeholder="Female"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.height_cm?.toString() || ''}
                  onChangeText={(text) => updateProfile({ height_cm: parseInt(text) || undefined })}
                  placeholder="165"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.weight_kg?.toString() || ''}
                  onChangeText={(text) => updateProfile({ weight_kg: parseFloat(text) || undefined })}
                  placeholder="65"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={profile.location || ''}
                onChangeText={(text) => updateProfile({ location: text })}
                placeholder="City, State"
              />
            </View>
          </View>

          {/* Goals & Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goals</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            
            <View style={styles.chipsContainer}>
              {FITNESS_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.chip,
                    (profile.goals || []).includes(goal.value) && styles.chipSelected
                  ]}
                  onPress={() => toggleGoal(goal.value)}
                >
                  <Text style={[
                    styles.chipText,
                    (profile.goals || []).includes(goal.value) && styles.chipTextSelected
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Training Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Preferences</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Training Style</Text>
              {TRAINING_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.radioOption,
                    profile.preferred_training_style === style.value && styles.radioOptionSelected
                  ]}
                  onPress={() => updateProfile({ preferred_training_style: style.value })}
                >
                  <View style={[
                    styles.radioCircle,
                    profile.preferred_training_style === style.value && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioText}>{style.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Workout Frequency (per week)</Text>
              <View style={styles.frequencyContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      profile.frequency_per_week === freq && styles.frequencyButtonSelected
                    ]}
                    onPress={() => updateProfile({ frequency_per_week: freq })}
                  >
                    <Text style={[
                      styles.frequencyText,
                      profile.frequency_per_week === freq && styles.frequencyTextSelected
                    ]}>
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Health Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Activity Level</Text>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.radioOption,
                    profile.activity_level === level.value && styles.radioOptionSelected
                  ]}
                  onPress={() => updateProfile({ activity_level: level.value })}
                >
                  <View style={[
                    styles.radioCircle,
                    profile.activity_level === level.value && styles.radioCircleSelected
                  ]} />
                  <View>
                    <Text style={styles.radioText}>{level.label}</Text>
                    <Text style={styles.radioSubtext}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Physical Limitations or Injuries</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.physical_limitations || ''}
                onChangeText={(text) => updateProfile({ physical_limitations: text })}
                placeholder="Describe any injuries, limitations, or areas to avoid..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medications (Optional)</Text>
              <TextInput
                style={styles.input}
                value={profile.medications || ''}
                onChangeText={(text) => updateProfile({ medications: text })}
                placeholder="List any medications that might affect exercise"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Motivation Level</Text>
              <Text style={styles.motivationValue}>{profile.motivation_level}/10</Text>
              <View style={styles.motivationContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.motivationButton,
                      (profile.motivation_level || 5) >= level && styles.motivationButtonSelected
                    ]}
                    onPress={() => updateProfile({ motivation_level: level })}
                  >
                    <Text style={styles.motivationText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Equipment Access Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Access</Text>
            <Text style={styles.sectionSubtitle}>What equipment do you have access to?</Text>
            
            <View style={styles.chipsContainer}>
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.chip,
                    (profile.equipment_access || []).includes(equipment) && styles.chipSelected
                  ]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text style={[
                    styles.chipText,
                    (profile.equipment_access || []).includes(equipment) && styles.chipTextSelected
                  ]}>
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Allow trainer recommendations</Text>
                <Text style={styles.switchDescription}>
                  Let trainers find and contact you with personalized program recommendations
                </Text>
              </View>
              <Switch
                value={profile.discoverable}
                onValueChange={(value) => updateProfile({ discoverable: value })}
                trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!hasChanges || saving}
            >
              <Text style={[
                styles.saveButtonText,
                !hasChanges && styles.saveButtonTextDisabled
              ]}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>
            
            {isOnboarding && (
              <Text style={styles.onboardingNote}>
                Complete your profile to get personalized program recommendations
              </Text>
            )}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
  },
  radioOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  radioSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  frequencyTextSelected: {
    color: COLORS.white,
  },
  motivationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  motivationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  motivationButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  motivationText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  saveContainer: {
    paddingVertical: 24,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  onboardingNote: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});