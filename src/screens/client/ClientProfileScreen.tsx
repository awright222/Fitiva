import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { FEATURES } from '../../config/features';
import { useAuth } from '../../context/AuthContext';

// TODO: SUPABASE INTEGRATION POINTS
// ================================
// 1. Profile Updates: Replace local state with supabase.from('users').update()
// 2. Health Data: Connect to 'client_health_profiles' table
// 3. Trainer Assignment: Display from 'user_organizations' relationships
// 4. Caregiver Access: Future integration with family member accounts
// 5. Terms & Consents: Link to 'user_consents' table for compliance

interface ClientProfileData {
  // Personal Information
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  
  // Health Information
  height: string; // in feet/inches format for seniors
  weight: string; // in lbs
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_notes: string;
  
  // Fitness Goals & Preferences
  fitness_goals: string[];
  exercise_limitations: string;
  preferred_workout_time: 'morning' | 'afternoon' | 'evening';
  
  // App Preferences
  notification_reminders: boolean;
  notification_progress: boolean;
  notification_messages: boolean;
  
  // Trainer Information (readonly)
  assigned_trainer: string;
  trainer_since: string;
}

export const ClientProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ClientProfileData>({
    // Personal Information - TODO: Load from Supabase users table
    full_name: 'John Doe',
    email: user?.email || 'johndoe@example.com',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1965-03-15',
    
    // Health Information - TODO: Load from client_health_profiles table
    height: '5\' 10"',
    weight: '175 lbs',
    gender: 'male',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+1 (555) 987-6543',
    medical_notes: 'Mild arthritis in knees. Taking blood pressure medication.',
    
    // Fitness Goals - TODO: Load from user preferences
    fitness_goals: ['Weight Management', 'Strength Building', 'Balance & Mobility'],
    exercise_limitations: 'Avoid high-impact exercises due to knee arthritis',
    preferred_workout_time: 'morning',
    
    // App Preferences - TODO: Load from user_preferences table
    notification_reminders: true,
    notification_progress: true,
    notification_messages: true,
    
    // Trainer Information - TODO: Load from user_organizations join
    assigned_trainer: 'Sarah Mitchell',
    trainer_since: 'September 2024',
  });

  const updateProfileData = (key: keyof ClientProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async (sectionId: string) => {
    try {
      // TODO: Save to Supabase
      // const { error } = await supabase.from('users').update(profileData).eq('id', user.id);
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderPersonalSection = () => {
    const isEditingThis = isEditing === 'personal';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          {!isEditingThis ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing('personal')}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveSection('personal')}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContent}>
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={profileData.full_name}
                onChangeText={(text) => updateProfileData('full_name', text)}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.full_name}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{profileData.email}</Text>
            <Text style={styles.fieldNote}>Contact support to change your email</Text>
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => updateProfileData('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.phone}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.fieldValue}>{new Date(profileData.date_of_birth).toLocaleDateString()}</Text>
            <Text style={styles.fieldNote}>Contact support to update your birth date</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHealthSection = () => {
    const isEditingThis = isEditing === 'health';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="fitness-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Health Information</Text>
          </View>
          {!isEditingThis ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing('health')}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveSection('health')}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContent}>
          {/* Height & Weight */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.fieldLabel}>Height</Text>
              {isEditingThis ? (
                <TextInput
                  style={styles.textInput}
                  value={profileData.height}
                  onChangeText={(text) => updateProfileData('height', text)}
                  placeholder="5' 10&quot;"
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.height}</Text>
              )}
            </View>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.fieldLabel}>Weight</Text>
              {isEditingThis ? (
                <TextInput
                  style={styles.textInput}
                  value={profileData.weight}
                  onChangeText={(text) => updateProfileData('weight', text)}
                  placeholder="175 lbs"
                />
              ) : (
                <Text style={styles.fieldValue}>{profileData.weight}</Text>
              )}
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Emergency Contact</Text>
            {isEditingThis ? (
              <>
                <TextInput
                  style={[styles.textInput, styles.marginBottom]}
                  value={profileData.emergency_contact_name}
                  onChangeText={(text) => updateProfileData('emergency_contact_name', text)}
                  placeholder="Contact name"
                />
                <TextInput
                  style={styles.textInput}
                  value={profileData.emergency_contact_phone}
                  onChangeText={(text) => updateProfileData('emergency_contact_phone', text)}
                  placeholder="Contact phone"
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldValue}>{profileData.emergency_contact_name}</Text>
                <Text style={styles.fieldValue}>{profileData.emergency_contact_phone}</Text>
              </>
            )}
          </View>

          {/* Medical Notes */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Medical Notes & Limitations</Text>
            {isEditingThis ? (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profileData.medical_notes}
                onChangeText={(text) => updateProfileData('medical_notes', text)}
                placeholder="Any medical conditions or exercise limitations"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.medical_notes}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTrainerSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Your Trainer</Text>
          </View>
        </View>

        <View style={styles.sectionContent}>
          <View style={styles.trainerCard}>
            <View style={styles.trainerAvatar}>
              <Text style={styles.avatarText}>SM</Text>
            </View>
            <View style={styles.trainerInfo}>
              <Text style={styles.trainerName}>{profileData.assigned_trainer}</Text>
              <Text style={styles.trainerSince}>Training with you since {profileData.trainer_since}</Text>
            </View>
            <TouchableOpacity style={styles.messageTrainerButton}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderNotificationsSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
        </View>

        <View style={styles.sectionContent}>
          {/* Workout Reminders */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Workout Reminders</Text>
              <Text style={styles.fieldDescription}>
                Get reminded about your scheduled sessions
              </Text>
            </View>
            <Switch
              value={profileData.notification_reminders}
              onValueChange={(value) => updateProfileData('notification_reminders', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={profileData.notification_reminders ? COLORS.white : COLORS.gray}
            />
          </View>

          {/* Progress Updates */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Progress Updates</Text>
              <Text style={styles.fieldDescription}>
                Receive notifications about your fitness progress
              </Text>
            </View>
            <Switch
              value={profileData.notification_progress}
              onValueChange={(value) => updateProfileData('notification_progress', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={profileData.notification_progress ? COLORS.white : COLORS.gray}
            />
          </View>

          {/* Messages */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Message Notifications</Text>
              <Text style={styles.fieldDescription}>
                Get notified when your trainer sends you a message
              </Text>
            </View>
            <Switch
              value={profileData.notification_messages}
              onValueChange={(value) => updateProfileData('notification_messages', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={profileData.notification_messages ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderAccountSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Account & Privacy</Text>
          </View>
        </View>

        <View style={styles.sectionContent}>
          {/* Caregiver Access Placeholder */}
          <TouchableOpacity 
            style={[styles.actionItem, styles.disabledItem]}
            disabled
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="people-outline" size={20} color={COLORS.gray} />
              <View>
                <Text style={[styles.actionItemText, styles.disabledText]}>Caregiver Access</Text>
                <Text style={styles.actionItemSubtext}>Coming soon in a future update</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Terms & Privacy', 'Terms and privacy settings would be displayed here')}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionItemText}>Terms & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Help & Support', 'Support contact information would be displayed here')}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity 
            style={[styles.actionItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.actionItemText, styles.signOutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.clientName}>{profileData.full_name}</Text>
              <Text style={styles.memberSince}>Fitiva member since {profileData.trainer_since}</Text>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {renderPersonalSection()}
        {renderHealthSection()}
        {renderTrainerSection()}
        {renderNotificationsSection()}
        {renderAccountSection()}

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
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  fieldNote: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  fieldDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  marginBottom: {
    marginBottom: 8,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
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
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  trainerSince: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  messageTrainerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionItemText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  actionItemSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  disabledItem: {
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.gray,
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: COLORS.error,
  },
  bottomSpacing: {
    height: 20,
  },
});