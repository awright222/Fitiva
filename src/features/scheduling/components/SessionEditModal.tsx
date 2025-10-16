import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, InputField } from '../../../components/ui';
import { Session, SessionStatus } from '../types';
import { updateSessionStatus } from '../data/mockData';
import { COLORS } from '../../../constants';

interface SessionEditModalProps {
  visible: boolean;
  session: Session | null;
  onClose: () => void;
  onSave: (updatedSession: Session) => void;
  userRole: 'client' | 'trainer';
}

export const SessionEditModal: React.FC<SessionEditModalProps> = ({
  visible,
  session,
  onClose,
  onSave,
  userRole,
}) => {
  const [notes, setNotes] = useState(session?.notes || '');
  const [status, setStatus] = useState<SessionStatus>(session?.status || 'pending');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Update session status and notes
      const updatedSession = updateSessionStatus(session.id, status);
      if (updatedSession) {
        // In a real app, this would also update notes via Supabase
        updatedSession.notes = notes;
        updatedSession.updated_at = new Date().toISOString();
        
        onSave(updatedSession);
        Alert.alert('Success', 'Session updated successfully');
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userRole === 'client' && session?.status === 'pending') {
      Alert.alert(
        'Cancel Session Request',
        'Are you sure you want to cancel this session request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              setStatus('canceled');
              handleSave();
            },
          },
        ]
      );
    } else if (userRole === 'trainer') {
      Alert.alert(
        'Cancel Session',
        'Are you sure you want to cancel this session?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              setStatus('canceled');
              handleSave();
            },
          },
        ]
      );
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const getStatusColor = (sessionStatus: SessionStatus) => {
    switch (sessionStatus) {
      case 'scheduled': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'canceled': return COLORS.gray;
      case 'pending': return COLORS.warning;
      default: return COLORS.gray;
    }
  };

  const getAvailableStatuses = (): { value: SessionStatus; label: string }[] => {
    if (userRole === 'trainer') {
      if (session?.status === 'pending') {
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'scheduled', label: 'Approve' },
          { value: 'canceled', label: 'Decline' },
        ];
      } else if (session?.status === 'scheduled') {
        return [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'completed', label: 'Mark Complete' },
          { value: 'canceled', label: 'Cancel' },
        ];
      }
    } else {
      // Client can only cancel pending requests
      if (session?.status === 'pending') {
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'canceled', label: 'Cancel Request' },
        ];
      }
    }
    return [{ value: session?.status || 'pending', label: session?.status || 'Pending' }];
  };

  if (!session) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Session Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Session Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Information</Text>
            <Text style={styles.sessionTitle}>{session.session_type}</Text>
            <Text style={styles.sessionDate}>{formatDateTime(session.scheduled_at)}</Text>
            <Text style={styles.sessionDuration}>
              Duration: {session.duration_minutes} minutes
            </Text>
            
            <View style={styles.participantInfo}>
              <Text style={styles.participantLabel}>
                {userRole === 'client' ? 'Trainer:' : 'Client:'}
              </Text>
              <Text style={styles.participantName}>
                {userRole === 'client' ? session.trainer_name : session.client_name}
              </Text>
            </View>
          </View>

          {/* Status Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusContainer}>
              {getAvailableStatuses().map((statusOption) => (
                <TouchableOpacity
                  key={statusOption.value}
                  style={[
                    styles.statusButton,
                    status === statusOption.value && {
                      backgroundColor: getStatusColor(statusOption.value),
                    },
                  ]}
                  onPress={() => setStatus(statusOption.value)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === statusOption.value && styles.statusTextSelected,
                    ]}
                  >
                    {statusOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <InputField
              label=""
              placeholder="Add session notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={loading ? 'Updating...' : 'Save Changes'}
              onPress={handleSave}
              disabled={loading}
              style={styles.saveButton}
            />
            
            {(userRole === 'client' && session.status === 'pending') ||
             (userRole === 'trainer' && session.status !== 'completed') ? (
              <Button
                title="Cancel Session"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelSessionButton}
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.surface,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  statusTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  notesInput: {
    marginBottom: 8,
  },
  actions: {
    paddingBottom: 32,
    gap: 16,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelSessionButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});