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
import { Trainer, TimeSlot, Session } from '../types';
import { 
  getTrainers, 
  getTrainerAvailability, 
  createSession 
} from '../data/mockData';
import { COLORS } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';

interface BookSessionScreenProps {
  navigation: any;
}

export const BookSessionScreen: React.FC<BookSessionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<string>('personal_training');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const trainers = getTrainers();
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

    setLoading(true);
    try {
      const scheduledDateTime = `${selectedSlot.date}T${selectedSlot.start_time}:00`;
      const newSession = createSession({
        client_id: user.id,
        trainer_id: selectedTrainer.id,
        scheduled_at: scheduledDateTime,
        duration_minutes: 60, // Default duration
        session_type: sessionType as Session['session_type'],
        status: 'pending',
        notes: notes || undefined,
      });

      Alert.alert(
        'Session Requested',
        `Your ${sessionType.replace('_', ' ')} session with ${selectedTrainer.name} has been requested for ${formatSlotTime(selectedSlot)}. You'll receive a confirmation once the trainer approves.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
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
          title={loading ? 'Booking...' : 'Request Session'}
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
});