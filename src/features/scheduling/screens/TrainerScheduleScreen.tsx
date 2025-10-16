import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScheduleList } from '../components';
import { SectionHeader, Button } from '../../../components/ui';
import { Session, SessionStatus } from '../types';
import { getSessionsByTrainer, updateSessionStatus } from '../data/mockData';
import { COLORS } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';

interface TrainerScheduleScreenProps {
  navigation: any;
}

export const TrainerScheduleScreen: React.FC<TrainerScheduleScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>(() => 
    getSessionsByTrainer(user?.id || '2') // Default to trainer ID 2 for testing
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
      
      const actionText = (() => {
        switch (newStatus) {
          case 'scheduled': return 'confirmed';
          case 'canceled': return 'canceled';
          case 'completed': return 'marked as completed';
          default: return 'updated';
        }
      })();
      
      Alert.alert('Success', `Session ${actionText} successfully`);
    }
  };

  const handleManageAvailability = () => {
    // TODO: Navigate to availability management screen
    navigation.navigate('ManageAvailability');
  };

  const pendingSessions = sessions.filter(session => session.status === 'pending');
  const upcomingSessions = sessions.filter(session => session.status === 'scheduled');
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString() && 
           (session.status === 'scheduled' || session.status === 'pending');
  });
  const recentSessions = sessions.filter(session => 
    session.status === 'completed' || session.status === 'canceled'
  ).slice(0, 5); // Show only recent 5

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Manage Availability Button */}
        <Button
          title="Manage Availability"
          onPress={handleManageAvailability}
          style={styles.availabilityButton}
        />

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <>
            <SectionHeader 
              title="Today's Sessions" 
              subtitle={`${todaySessions.length} sessions today`}
            />
            <View style={styles.sessionList}>
              <ScheduleList
                sessions={todaySessions}
                showParticipant="client"
                onSessionPress={handleSessionPress}
                onStatusChange={handleStatusChange}
                emptyMessage="No sessions scheduled for today"
              />
            </View>
          </>
        )}

        {/* Pending Requests */}
        {pendingSessions.length > 0 && (
          <>
            <SectionHeader 
              title="Pending Requests" 
              subtitle={`${pendingSessions.length} requests need your attention`}
            />
            <View style={styles.sessionList}>
              <ScheduleList
                sessions={pendingSessions}
                showParticipant="client"
                onSessionPress={handleSessionPress}
                onStatusChange={handleStatusChange}
                emptyMessage="No pending session requests"
              />
            </View>
          </>
        )}

        {/* Upcoming Sessions */}
        <SectionHeader 
          title="Upcoming Sessions" 
          subtitle={`${upcomingSessions.length} confirmed sessions`}
        />
        <View style={styles.sessionList}>
          <ScheduleList
            sessions={upcomingSessions}
            showParticipant="client"
            onSessionPress={handleSessionPress}
            onStatusChange={handleStatusChange}
            emptyMessage="No upcoming sessions scheduled"
          />
        </View>

        {/* Recent Sessions */}
        <SectionHeader 
          title="Recent Sessions" 
          subtitle={`Last ${recentSessions.length} sessions`}
        />
        <View style={styles.sessionList}>
          <ScheduleList
            sessions={recentSessions}
            showParticipant="client"
            onSessionPress={handleSessionPress}
            emptyMessage="No recent sessions"
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
  availabilityButton: {
    marginBottom: 24,
  },
  sessionList: {
    flex: 1,
    marginBottom: 24,
  },
});