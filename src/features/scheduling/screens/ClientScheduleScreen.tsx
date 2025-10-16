import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScheduleList } from '../components';
import { SectionHeader, Button } from '../../../components/ui';
import { Session, SessionStatus } from '../types';
import { getSessionsByClient, updateSessionStatus } from '../data/mockData';
import { COLORS } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';

interface ClientScheduleScreenProps {
  navigation: any;
}

export const ClientScheduleScreen: React.FC<ClientScheduleScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>(() => 
    getSessionsByClient(user?.id || '1') // Default to client ID 1 for testing
  );

  const handleSessionPress = (session: Session) => {
    // TODO: Navigate to session details screen
    console.log('Session pressed:', session);
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    const updatedSession = updateSessionStatus(sessionId, newStatus);
    if (updatedSession) {
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId ? updatedSession : session
        )
      );
      
      const actionText = newStatus === 'canceled' ? 'canceled' : 'updated';
      Alert.alert('Success', `Session ${actionText} successfully`);
    }
  };

  const handleBookSession = () => {
    // TODO: Navigate to booking screen
    navigation.navigate('BookSession');
  };

  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' || session.status === 'pending'
  );

  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || session.status === 'canceled'
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Book Session Button */}
        <Button
          title="Book New Session"
          onPress={handleBookSession}
          style={styles.bookButton}
        />

        {/* Upcoming Sessions */}
        <SectionHeader 
          title="Upcoming Sessions" 
          subtitle={`${upcomingSessions.length} sessions`}
        />
        <View style={styles.sessionList}>
          <ScheduleList
            sessions={upcomingSessions}
            showParticipant="trainer"
            onSessionPress={handleSessionPress}
            onStatusChange={handleStatusChange}
            emptyMessage="No upcoming sessions scheduled"
          />
        </View>

        {/* Session History */}
        <SectionHeader 
          title="Session History" 
          subtitle={`${pastSessions.length} completed sessions`}
        />
        <View style={styles.sessionList}>
          <ScheduleList
            sessions={pastSessions}
            showParticipant="trainer"
            onSessionPress={handleSessionPress}
            emptyMessage="No session history yet"
          />
        </View>
      </View>
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
  },
  bookButton: {
    marginBottom: 24,
  },
  sessionList: {
    flex: 1,
    marginBottom: 24,
  },
});