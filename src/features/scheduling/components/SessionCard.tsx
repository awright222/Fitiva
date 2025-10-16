import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Session, SessionStatus } from '../types';
import { COLORS } from '../../../constants';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  showParticipant?: 'trainer' | 'client'; // Which participant to show
  showActions?: boolean;
  onStatusChange?: (sessionId: string, newStatus: SessionStatus) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  showParticipant = 'trainer',
  showActions = false,
  onStatusChange,
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sessionType}>{session.session_type || 'Personal Training'}</Text>
        <Text style={styles.participantName}>
          {showParticipant === 'trainer' ? 'Trainer: ' : 'Client: '}{participantName}
        </Text>
        {session.duration_minutes && (
          <Text style={styles.duration}>{session.duration_minutes} minutes</Text>
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
});