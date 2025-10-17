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
import { mockTrainerData } from '../../data/mockData';

interface ProfileSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  editable: boolean;
}

interface EditableField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'list';
  placeholder?: string;
}

export const TrainerProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: 'Sarah Mitchell',
    email: 'sarah.mitchell@fitiva.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate fitness trainer with 5+ years of experience helping clients achieve their health and wellness goals. Specialized in strength training, nutrition coaching, and injury prevention.',
    location: 'San Francisco, CA',
    
    // Professional Information
    certifications: mockTrainerData.stats.certifications,
    specialties: ['Strength Training', 'Cardio', 'Nutrition Coaching', 'Injury Prevention', 'Weight Loss'],
    years_experience: mockTrainerData.stats.years_experience,
    hourly_rate: 85,
    
    // Preferences
    max_clients: 30,
    auto_booking: true,
    notification_email: true,
    notification_push: true,
    notification_sms: false,
  });

  const profileSections: ProfileSection[] = [
    { id: 'personal', title: 'Personal Information', icon: 'person-outline', editable: true },
    { id: 'professional', title: 'Professional Details', icon: 'briefcase-outline', editable: true },
    { id: 'preferences', title: 'Business Preferences', icon: 'settings-outline', editable: true },
    { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', editable: true },
    { id: 'account', title: 'Account Management', icon: 'shield-outline', editable: false },
  ];

  const handleSaveSection = (sectionId: string) => {
    // Mock save functionality
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    // Reset form data if needed
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Show immediate feedback for toggle changes
    if (typeof value === 'boolean') {
      const settingName = key.replace('_', ' ').replace('notification', '').trim();
      // You could add a toast notification here in a real app
      console.log(`${settingName} ${value ? 'enabled' : 'disabled'}`);
    }
  };

  const renderPersonalSection = () => {
    const isEditingThis = isEditing === 'personal';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          {!isEditingThis ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing('personal')}
            >
              <Ionicons name="pencil" size={16} color={COLORS.secondary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
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
                value={formData.full_name}
                onChangeText={(text) => updateFormData('full_name', text)}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.full_name}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.phone}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Bio</Text>
            {isEditingThis ? (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => updateFormData('bio', text)}
                placeholder="Tell clients about yourself and your approach"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.bio}</Text>
            )}
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Location</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => updateFormData('location', text)}
                placeholder="Enter your location"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.location}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderProfessionalSection = () => {
    const isEditingThis = isEditing === 'professional';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Professional Details</Text>
          </View>
          {!isEditingThis ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing('professional')}
            >
              <Ionicons name="pencil" size={16} color={COLORS.secondary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveSection('professional')}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContent}>
          {/* Years of Experience */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Years of Experience</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.years_experience.toString()}
                onChangeText={(text) => updateFormData('years_experience', parseInt(text) || 0)}
                placeholder="Enter years of experience"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.years_experience} years</Text>
            )}
          </View>

          {/* Hourly Rate */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Hourly Rate</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.hourly_rate.toString()}
                onChangeText={(text) => updateFormData('hourly_rate', parseInt(text) || 0)}
                placeholder="Enter hourly rate"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.fieldValue}>${formData.hourly_rate}/hour</Text>
            )}
          </View>

          {/* Certifications */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Certifications</Text>
            {isEditingThis ? (
              <View style={styles.listEditor}>
                <Text style={styles.listHelperText}>
                  Tap items to remove, or add new ones below
                </Text>
                <View style={styles.tagContainer}>
                  {formData.certifications.map((cert, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => {
                        const newCerts = formData.certifications.filter((_, i) => i !== index);
                        updateFormData('certifications', newCerts);
                      }}
                    >
                      <Text style={styles.tagText}>{cert}</Text>
                      <Ionicons name="close" size={12} color={COLORS.white} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add new certification (press enter)"
                  onSubmitEditing={(event) => {
                    const newCert = event.nativeEvent.text.trim();
                    if (newCert && !formData.certifications.includes(newCert)) {
                      updateFormData('certifications', [...formData.certifications, newCert]);
                    }
                    // Clear the input by resetting the value
                  }}
                  blurOnSubmit={false}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <View style={styles.tagContainer}>
                {formData.certifications.map((cert, index) => (
                  <View key={index} style={styles.tagReadOnly}>
                    <Text style={styles.tagTextReadOnly}>{cert}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Specialties */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Specialties</Text>
            {isEditingThis ? (
              <View style={styles.listEditor}>
                <Text style={styles.listHelperText}>
                  Tap items to remove, or add new ones below
                </Text>
                <View style={styles.tagContainer}>
                  {formData.specialties.map((specialty, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => {
                        const newSpecialties = formData.specialties.filter((_, i) => i !== index);
                        updateFormData('specialties', newSpecialties);
                      }}
                    >
                      <Text style={styles.tagText}>{specialty}</Text>
                      <Ionicons name="close" size={12} color={COLORS.white} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add new specialty (press enter)"
                  onSubmitEditing={(event) => {
                    const newSpecialty = event.nativeEvent.text.trim();
                    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
                      updateFormData('specialties', [...formData.specialties, newSpecialty]);
                    }
                    // Clear the input by resetting the value
                  }}
                  blurOnSubmit={false}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <View style={styles.tagContainer}>
                {formData.specialties.map((specialty, index) => (
                  <View key={index} style={styles.tagReadOnly}>
                    <Text style={styles.tagTextReadOnly}>{specialty}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPreferencesSection = () => {
    const isEditingThis = isEditing === 'preferences';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="settings-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Business Preferences</Text>
          </View>
          {!isEditingThis ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing('preferences')}
            >
              <Ionicons name="pencil" size={16} color={COLORS.secondary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveSection('preferences')}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContent}>
          {/* Max Clients */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Maximum Clients</Text>
            {isEditingThis ? (
              <TextInput
                style={styles.textInput}
                value={formData.max_clients.toString()}
                onChangeText={(text) => updateFormData('max_clients', parseInt(text) || 0)}
                placeholder="Maximum number of clients"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.max_clients} clients</Text>
            )}
          </View>

          {/* Auto Booking */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Auto-Accept Bookings</Text>
              <Text style={styles.fieldDescription}>
                Automatically confirm client booking requests within your availability
              </Text>
            </View>
            <Switch
              value={formData.auto_booking}
              onValueChange={(value) => updateFormData('auto_booking', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
              thumbColor={formData.auto_booking ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderNotificationsSection = () => {
    const isEditingThis = isEditing === 'notifications';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
        </View>

        <View style={styles.sectionContent}>
          {/* Email Notifications */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Email Notifications</Text>
              <Text style={styles.fieldDescription}>
                Receive notifications about bookings and messages via email
              </Text>
            </View>
            <Switch
              value={formData.notification_email}
              onValueChange={(value) => updateFormData('notification_email', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
              thumbColor={formData.notification_email ? COLORS.white : COLORS.gray}
            />
          </View>

          {/* Push Notifications */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>Push Notifications</Text>
              <Text style={styles.fieldDescription}>
                Receive instant notifications on your device
              </Text>
            </View>
            <Switch
              value={formData.notification_push}
              onValueChange={(value) => updateFormData('notification_push', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
              thumbColor={formData.notification_push ? COLORS.white : COLORS.gray}
            />
          </View>

          {/* SMS Notifications */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.fieldLabel}>SMS Notifications</Text>
              <Text style={styles.fieldDescription}>
                Receive text messages for urgent updates
              </Text>
            </View>
            <Switch
              value={formData.notification_sms}
              onValueChange={(value) => updateFormData('notification_sms', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
              thumbColor={formData.notification_sms ? COLORS.white : COLORS.gray}
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
            <Ionicons name="shield-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Account Management</Text>
          </View>
        </View>

        <View style={styles.sectionContent}>
          {/* Change Password */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Change Password', 'Password change functionality would be implemented here')}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="key-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.actionItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Privacy Settings */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Privacy Settings', 'Privacy settings would be implemented here')}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.actionItemText}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Data Export */}
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Export Data', 'Data export functionality would be implemented here')}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="download-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.actionItemText}>Export My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity 
            style={[styles.actionItem, styles.signOutItem]}
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive' }
            ])}
          >
            <View style={styles.actionItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.actionItemText, styles.signOutText]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
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
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SM</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color={COLORS.secondary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.trainerName}>{formData.full_name}</Text>
            <Text style={styles.trainerTitle}>Certified Personal Trainer</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{mockTrainerData.stats.total_clients}</Text>
                <Text style={styles.statLabel}>Clients</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{mockTrainerData.stats.average_rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formData.years_experience}y</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {renderPersonalSection()}
        {renderProfessionalSection()}
        {renderPreferencesSection()}
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
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.background,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changePhotoText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  headerInfo: {
    alignItems: 'center',
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  trainerTitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  editButtonText: {
    color: COLORS.secondary,
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
    backgroundColor: COLORS.secondary,
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 22,
  },
  fieldDescription: {
    fontSize: 12,
    color: COLORS.gray,
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
  listEditor: {
    gap: 12,
  },
  listHelperText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagReadOnly: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextReadOnly: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
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