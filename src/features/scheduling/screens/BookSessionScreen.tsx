import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, InputField } from '../../../components/ui';
import { Trainer, TimeSlot, Session, SessionMode } from '../types';
import { 
  getTrainers, 
  getTrainerAvailability, 
  createSession 
} from '../data/mockData';
import { COLORS } from '../../../constants';
import { FEATURES } from '../../../config/features';
import { useAuth } from '../../../context/AuthContext';

interface BookSessionScreenProps {
  navigation: any;
  route?: {
    params?: {
      editSession?: Session;
    };
  };
}

export const BookSessionScreen: React.FC<BookSessionScreenProps> = ({ navigation, route }) => {
  const { user, userProfile } = useAuth();
  const editSession = route?.params?.editSession;
  const trainers = getTrainers(); // Move this up before state initialization
  
  // Initialize form with edit session data if available
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(() => {
    if (editSession) {
      const trainer = trainers.find(t => t.id === editSession.trainer_id);
      return trainer || null;
    }
    return null;
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null); // Will be populated based on edit session
  const [sessionType, setSessionType] = useState<string>(editSession?.session_type || 'personal_training');
  const [sessionMode, setSessionMode] = useState<SessionMode>(editSession?.session_mode || 'in_person');
  const [videoLink, setVideoLink] = useState<string>(editSession?.video_link || '');
  const [notes, setNotes] = useState<string>(editSession?.notes || '');
  const [loading, setLoading] = useState<boolean>(false);

  const availability = selectedTrainer 
    ? getTrainerAvailability(selectedTrainer.id)
    : [];

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(null); // Reset slot selection when trainer changes
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.is_available) {
      setSelectedSlot(slot);
    }
  };

  const formatSlotTime = (slot: TimeSlot) => {
    const slotDate = new Date(`${slot.date}T${slot.start_time}:00`);
    return `${slotDate.toLocaleDateString()} at ${slot.start_time}`;
  };

  const handleBookSession = async () => {
    if (!selectedTrainer || !selectedSlot || !user) {
      Alert.alert('Error', 'Please select a trainer and time slot');
      return;
    }

    // Validate session mode specific requirements
    if (sessionMode === 'virtual' && !videoLink.trim()) {
      Alert.alert('Error', 'Please provide a video link for virtual sessions');
      return;
    }
    
    // Self-guided sessions: program will be assigned by trainer after booking

    setLoading(true);
    try {
      const scheduledDateTime = `${selectedSlot.date}T${selectedSlot.start_time}:00`;
      const newSession = createSession({
        client_id: user.id,
        trainer_id: selectedTrainer.id,
        client_name: userProfile?.full_name || user.email, // Use full_name from profile or fallback to email
        trainer_name: selectedTrainer.name,
        scheduled_at: scheduledDateTime,
        duration_minutes: 60, // Default duration
        session_type: sessionType as Session['session_type'],
        session_mode: sessionMode, // NEW: Include session mode
        video_link: sessionMode === 'virtual' ? videoLink : undefined, // NEW: Video link for virtual sessions
        program_id: sessionMode === 'self_guided' ? null : undefined, // NEW: Null for self-guided (trainer assigns later)
        status: 'pending',
        notes: notes || undefined,
      });

      // Navigate back immediately
      navigation.goBack();
      
      // Show success message after navigation
      const successMessage = editSession
        ? `Your session has been updated successfully!`
        : sessionMode === 'self_guided' 
        ? `Your ${sessionType.replace('_', ' ')} session with ${selectedTrainer.name} has been requested for ${formatSlotTime(selectedSlot)}. Your trainer will assign a workout program and confirm the session.`
        : `Your ${sessionType.replace('_', ' ')} session with ${selectedTrainer.name} has been requested for ${formatSlotTime(selectedSlot)}. You'll receive a confirmation once the trainer approves.`;

      // Use setTimeout to show alert after navigation completes
      setTimeout(() => {
        Alert.alert(editSession ? 'Updated' : 'Success', successMessage);
      }, 500);
      
      // TODO: When REMINDERS_ENABLED, schedule push notification reminder
      // TODO: When REALTIME_ENABLED, instantly notify trainer of new booking request
      
      // Feature Flag: Payment Integration
      if (FEATURES.PAYMENTS_ENABLED) {
        // TODO: Integrate Stripe payment flow here
        console.log('Processing payment for session...');
      } else {
        console.log('Session booked without payment - trainer will handle billing');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sessionTypes = [
    { id: 'personal_training', label: 'Personal Training' },
    { id: 'group_class', label: 'Group Class' },
    { id: 'consultation', label: 'Consultation' },
  ];

  // NEW: Session mode options for hybrid scheduling
  const sessionModes = [
    { id: 'in_person' as SessionMode, label: 'In Person', description: 'Meet at the gym' },
    { id: 'virtual' as SessionMode, label: 'Virtual', description: 'Video call session' },
    ...(FEATURES.SELF_GUIDED_ENABLED ? [{ 
      id: 'self_guided' as SessionMode, 
      label: 'Self-Guided', 
      description: 'Your trainer will assign a program for independent workout' 
    }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Type Selection */}
        <Text style={styles.sectionTitle}>Session Type</Text>
        <View style={styles.sessionTypeContainer}>
          {sessionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.sessionTypeButton,
                sessionType === type.id && styles.sessionTypeButtonSelected,
              ]}
              onPress={() => setSessionType(type.id)}
            >
              <Text
                style={[
                  styles.sessionTypeText,
                  sessionType === type.id && styles.sessionTypeTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NEW: Session Mode Selection */}
        <Text style={styles.sectionTitle}>Session Mode</Text>
        <View style={styles.sessionModeContainer}>
          {sessionModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.sessionModeCard,
                sessionMode === mode.id && styles.sessionModeCardSelected,
              ]}
              onPress={() => setSessionMode(mode.id)}
            >
              <Text
                style={[
                  styles.sessionModeTitle,
                  sessionMode === mode.id && styles.sessionModeTextSelected,
                ]}
              >
                {mode.label}
              </Text>
              <Text
                style={[
                  styles.sessionModeDescription,
                  sessionMode === mode.id && styles.sessionModeDescriptionSelected,
                ]}
              >
                {mode.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info about self-guided sessions */}
        {sessionMode === 'self_guided' && (
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 For self-guided sessions, your trainer will assign a personalized workout program after confirming your request.
            </Text>
          </View>
        )}

        {/* NEW: Virtual Session Video Link Input */}
        {sessionMode === 'virtual' && (
          <View style={styles.conditionalSection}>
            <Text style={styles.sectionTitle}>Video Link</Text>
            <InputField
              label=""
              placeholder="Enter Zoom, Teams, or other video link"
              value={videoLink}
              onChangeText={setVideoLink}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Trainer Selection */}
        <Text style={styles.sectionTitle}>Select Trainer</Text>
        <View style={styles.trainerContainer}>
          {trainers.map((trainer) => (
            <TouchableOpacity
              key={trainer.id}
              style={[
                styles.trainerCard,
                selectedTrainer?.id === trainer.id && styles.trainerCardSelected,
              ]}
              onPress={() => handleTrainerSelect(trainer)}
            >
              <Text style={styles.trainerName}>{trainer.name}</Text>
              <Text style={styles.trainerSpecialty}>{trainer.specialty}</Text>
              <Text style={styles.trainerRate}>${trainer.hourly_rate}/hour</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Slot Selection */}
        {selectedTrainer && (
          <>
            <Text style={styles.sectionTitle}>Available Times</Text>
            <View style={styles.slotContainer}>
              {availability.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No available slots for this trainer
                </Text>
              ) : (
                availability.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotButton,
                      !slot.is_available && styles.slotButtonDisabled,
                      selectedSlot === slot && styles.slotButtonSelected,
                    ]}
                    onPress={() => handleSlotSelect(slot)}
                    disabled={!slot.is_available}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !slot.is_available && styles.slotTextDisabled,
                        selectedSlot === slot && styles.slotTextSelected,
                      ]}
                    >
                      {formatSlotTime(slot)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {/* Notes Section */}
        <Text style={styles.sectionTitle}>Session Notes (Optional)</Text>
        <InputField
          label=""
          placeholder="Any specific goals or notes for this session..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        {/* Book Button */}
        <Button
          title={loading ? (editSession ? 'Updating...' : 'Booking...') : (editSession ? 'Update Session' : 'Request Session')}
          onPress={handleBookSession}
          disabled={!selectedTrainer || !selectedSlot || loading}
          style={styles.bookButton}
        />
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginTop: 20,
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  sessionTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.background,
  },
  sessionTypeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sessionTypeText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sessionTypeTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  trainerContainer: {
    gap: 12,
    marginBottom: 4,
  },
  trainerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.surface,
  },
  trainerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGray,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  trainerSpecialty: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  trainerRate: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  slotButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.surface,
  },
  slotButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
  },
  slotText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  slotTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  slotTextDisabled: {
    color: COLORS.text.secondary,
  },
  noSlotsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  notesInput: {
    marginBottom: 4,
  },
  bookButton: {
    marginTop: 24,
  },
  // NEW: Session mode styles
  sessionModeContainer: {
    gap: 12,
    marginBottom: 4,
  },
  sessionModeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.surface,
  },
  sessionModeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGray,
  },
  sessionModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sessionModeTextSelected: {
    color: COLORS.primary,
  },
  sessionModeDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sessionModeDescriptionSelected: {
    color: COLORS.text.primary,
  },
  conditionalSection: {
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  programSelector: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.surface,
  },
  programSelectorText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  // NEW: Info section styles
  infoSection: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});