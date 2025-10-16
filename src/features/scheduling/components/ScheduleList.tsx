import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SessionCard } from './SessionCard';
import { Session, SessionStatus } from '../types';
import { COLORS } from '../../../constants';

interface ScheduleListProps {
  sessions: Session[];
  title?: string;
  showParticipant?: 'trainer' | 'client';
  showActions?: boolean;
  onSessionPress?: (session: Session) => void;
  onStatusChange?: (sessionId: string, newStatus: SessionStatus) => void;
  emptyMessage?: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  sessions,
  title,
  showParticipant = 'trainer',
  showActions = false,
  onSessionPress,
  onStatusChange,
  emptyMessage = 'No sessions scheduled',
}) => {
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      onPress={() => onSessionPress?.(item)}
      showParticipant={showParticipant}
      showActions={showActions}
      onStatusChange={onStatusChange}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={sortedSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});