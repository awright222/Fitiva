import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Session, SessionStatus } from '../types';
import { COLORS } from '../../../constants';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  showParticipant?: 'trainer' | 'client'; // Which participant to show
  showActions?: boolean;
  onStatusChange?: (sessionId: string, newStatus: SessionStatus) => void;
  userRole?: 'client' | 'trainer'; // NEW: For session mode actions
  onEdit?: (session: Session) => void; // NEW: Edit session callback
  onCancel?: (session: Session) => void; // NEW: Cancel session callback
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  showParticipant = 'trainer',
  showActions = false,
  onStatusChange,
  userRole = 'client', // NEW: Default to client role
  onEdit,
  onCancel,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled':
        return COLORS.primary;
      case 'completed':
        return COLORS.success;
      case 'canceled':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      case 'pending':
        return 'Pending Approval';
      default:
        return status;
    }
  };

  const participantName = showParticipant === 'trainer' 
    ? session.trainer_name 
    : session.client_name;

  const handleStatusUpdate = (newStatus: SessionStatus) => {
    if (onStatusChange) {
      onStatusChange(session.id, newStatus);
    }
  };

  // NEW: Session mode specific actions
  const handleJoinVirtualSession = () => {
    if (session.video_link) {
      Linking.openURL(session.video_link).catch(() => {
        Alert.alert('Error', 'Unable to open video link');
      });
    } else {
      Alert.alert('Error', 'No video link provided for this session');
    }
  };

  const handleStartSelfGuided = () => {
    if (session.program_id) {
      Alert.alert(
        'Start Workout',
        'Ready to begin your self-guided workout program?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Workout',
            onPress: () => {
              // TODO: Navigate to program workout screen
              console.log(`Starting self-guided workout for program ${session.program_id}`);
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'No program assigned to this session');
    }
  };

  const getSessionModeDisplay = () => {
    switch (session.session_mode) {
      case 'in_person':
        return { icon: '🏋️', label: 'In Person' };
      case 'virtual':
        return { icon: '💻', label: 'Virtual' };
      case 'self_guided':
        return { icon: '📱', label: 'On Your Own' };
      default:
        return { icon: '🏋️', label: 'In Person' };
    }
  };

  const sessionModeInfo = getSessionModeDisplay();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.date}>{formatDate(session.scheduled_at)}</Text>
          <Text style={styles.time}>{formatTime(session.scheduled_at)}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
            <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
          </View>
          
          {/* NEW: Compact Edit/Cancel buttons for pending sessions */}
          {userRole === 'client' && session.status === 'pending' && (onEdit || onCancel) && (
            <View style={styles.compactActionsContainer}>
              {onEdit && (
                <TouchableOpacity 
                  style={[styles.compactActionButton, styles.compactEditButton]}
                  onPress={() => onEdit(session)}
                >
                  <Text style={styles.compactButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
              
              {onCancel && (
                <TouchableOpacity 
                  style={[styles.compactActionButton, styles.compactCancelButton]}
                  onPress={() => onCancel(session)}
                >
                  <Text style={styles.compactCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sessionType}>{session.session_type || 'Personal Training'}</Text>
        <Text style={styles.participantName}>
          {`${showParticipant === 'trainer' ? 'Trainer: ' : 'Client: '}${participantName}`}
        </Text>
        
        {/* NEW: Session mode display */}
        <Text style={styles.sessionMode}>
          {`${sessionModeInfo.icon} ${sessionModeInfo.label}`}
        </Text>
        
        {session.duration_minutes && (
          <Text style={styles.duration}>{`${session.duration_minutes} minutes`}</Text>
        )}
        {session.notes && (
          <Text style={styles.notes} numberOfLines={2}>{session.notes}</Text>
        )}
      </View>

      {showActions && session.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleStatusUpdate('scheduled')}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleStatusUpdate('canceled')}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* NEW: Session mode actions for clients */}
      {userRole === 'client' && session.status === 'scheduled' && (
        <View style={styles.sessionActionsContainer}>
          {session.session_mode === 'virtual' && (
            <TouchableOpacity 
              style={[styles.sessionActionButton, styles.joinButton]}
              onPress={handleJoinVirtualSession}
            >
              <Text style={styles.joinButtonText}>Join Session</Text>
            </TouchableOpacity>
          )}
          
          {session.session_mode === 'self_guided' && (
            <TouchableOpacity 
              style={[styles.sessionActionButton, styles.startButton]}
              onPress={handleStartSelfGuided}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          )}
          
          {session.session_mode === 'in_person' && (
            <View style={styles.inPersonInfo}>
              <Text style={styles.inPersonText}>📍 Ready for your in-person session</Text>
            </View>
          )}
        </View>
      )}


    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    marginBottom: 8,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  participantName: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  // NEW: Session mode styles
  sessionMode: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  sessionActionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sessionActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  inPersonInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  inPersonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // NEW: Edit/Cancel button styles
  editButton: {
    backgroundColor: COLORS.secondary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelSessionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelSessionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  // NEW: Compact header styles
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactActionsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  compactActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 4,
  },
  compactEditButton: {
    backgroundColor: COLORS.secondary,
  },
  compactCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  compactButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  compactCancelButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.error,
  },
});