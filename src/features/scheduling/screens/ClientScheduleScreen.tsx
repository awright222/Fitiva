import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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

  // Refresh sessions when screen comes into focus (e.g., after creating a new session)
  useFocusEffect(
    React.useCallback(() => {
      // Refresh sessions when screen comes into focus
      if (user?.id) {
        console.log('ClientScheduleScreen focused - refreshing sessions for user:', user.id);
        const refreshedSessions = getSessionsByClient(user.id);
        setSessions(refreshedSessions);
        console.log('Sessions updated:', refreshedSessions.length, 'sessions');
      }
    }, [user?.id])
  );

  const handleSessionPress = (session: Session) => {
    // TODO: Navigate to session details screen
    // TODO: When REALTIME_ENABLED, this could show live session updates
    console.log('Session pressed:', session);
  };

  const handleStatusChange = (sessionId: string | number, newStatus: SessionStatus) => {
    const updatedSession = updateSessionStatus(sessionId, newStatus);
    if (updatedSession) {
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId ? updatedSession : session
        )
      );
      
      const actionText = newStatus === 'canceled' ? 'canceled' : 'updated';
      Alert.alert('Success', `Session ${actionText} successfully`);
      
      // TODO: When REMINDERS_ENABLED, send push notification to trainer about cancellation
    }
  };

  const handleBookSession = () => {
    // TODO: Navigate to booking screen
    navigation.navigate('BookSession');
  };

  const handleEditSession = (session: Session) => {
    // Navigate to edit session screen (reuse BookSession with pre-filled data)
    navigation.navigate('BookSession', { editSession: session });
  };

  const handleCancelSession = (session: Session) => {
    console.log('handleCancelSession called for session:', session.id);
    
    // Web-compatible confirmation
    const confirmCancel = window.confirm(`Are you sure you want to cancel your ${session.session_type} session?`);
    
    if (confirmCancel) {
      console.log('User confirmed cancellation, updating session status...');
      const updatedSession = updateSessionStatus(session.id, 'canceled');
      console.log('Updated session:', updatedSession);
      if (updatedSession) {
        setSessions(prevSessions =>
          prevSessions.map(s => s.id === session.id ? updatedSession : s)
        );
        console.log('Session successfully canceled and UI updated');
        // Web-compatible success message
        alert('Session request canceled successfully!');
      } else {
        console.error('Failed to update session status');
      }
    } else {
      console.log('User canceled the cancellation');
    }
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
            userRole="client"
            onEditSession={handleEditSession}
            onCancelSession={handleCancelSession}
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
            userRole="client"
            onEditSession={handleEditSession}
            onCancelSession={handleCancelSession}
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