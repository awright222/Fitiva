import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { SectionHeader } from '../../components/ui';
import { mockTrainerData } from '../../data/mockData';

interface TrainerScheduleScreenProps {
  navigation?: any;
}

// TypeScript Interfaces
interface Session {
  id: string;
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  session_type: 'personal' | 'group' | 'assessment';
  session_category: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  location: string;
  notes: string;
  program_id: string;
  program_name: string;
}

interface SessionRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  requested_date: string;
  requested_time: string;
  session_type: 'personal' | 'group' | 'assessment';
  session_category: string;
  message: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

interface TimeSlot {
  start: string;
  end: string;
  isBooked: boolean;
}

interface WeeklyAvailability {
  day: string;
  dayIndex: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

// Supabase-aligned interface for trainer_availability table
interface TrainerAvailability {
  id: string;
  trainer_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

const TrainerScheduleScreen: React.FC<TrainerScheduleScreenProps> = ({ navigation }) => {
  // State Management
  const [activeTab, setActiveTab] = useState<'sessions' | 'requests' | 'availability'>('sessions');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'personal' | 'group' | 'assessment'>('all');
  const [historyFilter, setHistoryFilter] = useState<'upcoming' | 'past' | 'canceled'>('upcoming');
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>(
    mockTrainerData.upcomingSessions as Session[]
  );
  const [pastSessions, setPastSessions] = useState<Session[]>(
    mockTrainerData.pastSessions as Session[]
  );
  const [canceledSessions, setCanceledSessions] = useState<Session[]>(
    mockTrainerData.canceledSessions as Session[]
  );
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>(
    mockTrainerData.sessionRequests as SessionRequest[]
  );
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>(
    mockTrainerData.weeklyAvailability as WeeklyAvailability[]
  );
  const [trainerAvailability, setTrainerAvailability] = useState<TrainerAvailability[]>(
    mockTrainerData.trainerAvailability as TrainerAvailability[]
  );
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Utility Functions
  const convertSupabaseToLegacyFormat = (supabaseAvailability: TrainerAvailability[]): WeeklyAvailability[] => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData: WeeklyAvailability[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const daySlots = supabaseAvailability.filter(slot => slot.day_of_week === dayIndex);
      const isAvailable = daySlots.length > 0 && daySlots.some(slot => slot.is_available);
      
      weeklyData.push({
        day: dayNames[dayIndex],
        dayIndex,
        isAvailable,
        timeSlots: daySlots.map(slot => ({
          start: slot.start_time,
          end: slot.end_time,
          isBooked: slot.is_booked,
        })),
      });
    }

    return weeklyData;
  };

  const convertLegacyToSupabaseFormat = (weeklyData: WeeklyAvailability[], trainerId: string): TrainerAvailability[] => {
    const supabaseData: TrainerAvailability[] = [];
    
    weeklyData.forEach((day) => {
      if (day.isAvailable && day.timeSlots.length > 0) {
        day.timeSlots.forEach((slot, index) => {
          supabaseData.push({
            id: `${trainerId}_${day.dayIndex}_${index}`,
            trainer_id: trainerId,
            day_of_week: day.dayIndex,
            start_time: slot.start,
            end_time: slot.end,
            is_available: day.isAvailable,
            is_booked: slot.isBooked,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
      }
    });

    return supabaseData;
  };

  // Initialize legacy format from Supabase data for display
  useEffect(() => {
    const legacyFormat = convertSupabaseToLegacyFormat(trainerAvailability);
    setWeeklyAvailability(legacyFormat);
  }, [trainerAvailability]);

  // Smart Availability Splitting & Syncing
  const syncSessionsWithAvailability = () => {
    // Get all confirmed/pending sessions that should block availability
    const blockingSessions = [...upcomingSessions, ...pastSessions]
      .filter(session => session.status === 'confirmed' || session.status === 'pending');

    // Process each day of the week
    let newAvailabilitySlots: TrainerAvailability[] = [];

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // Get original availability slots for this day (not booked by sessions)
      const originalDaySlots = trainerAvailability.filter(slot => 
        slot.day_of_week === dayOfWeek && 
        slot.is_available &&
        !slot.is_booked // Only process originally available slots
      );

      // Get sessions for this day
      const daySessions = blockingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getDay() === dayOfWeek;
      });

      if (originalDaySlots.length === 0) {
        // No availability for this day, add any existing slots as-is
        newAvailabilitySlots.push(...trainerAvailability.filter(slot => 
          slot.day_of_week === dayOfWeek
        ));
        continue;
      }

      // Process each original availability slot
      for (const originalSlot of originalDaySlots) {
        const newSlots = splitAvailabilitySlot(originalSlot, daySessions);
        newAvailabilitySlots.push(...newSlots);
      }

      // Add any unavailable/manually blocked slots for this day
      const unavailableSlots = trainerAvailability.filter(slot => 
        slot.day_of_week === dayOfWeek && !slot.is_available
      );
      newAvailabilitySlots.push(...unavailableSlots);
    }

    setTrainerAvailability(newAvailabilitySlots);
    
    console.log('🔄 Smart availability sync completed:', {
      originalSlots: trainerAvailability.length,
      newSlots: newAvailabilitySlots.length,
      bookedSlots: newAvailabilitySlots.filter(slot => slot.is_booked).length,
      blockingSessions: blockingSessions.length
    });
  };

  // Split an availability slot based on overlapping sessions
  const splitAvailabilitySlot = (originalSlot: TrainerAvailability, sessions: Session[]): TrainerAvailability[] => {
    const slotStart = timeToMinutes(originalSlot.start_time);
    const slotEnd = timeToMinutes(originalSlot.end_time);
    
    // Find all sessions that overlap with this slot
    const overlappingSessions = sessions.filter(session => 
      checkTimeOverlap(
        originalSlot.start_time,
        originalSlot.end_time,
        session.start_time,
        session.end_time
      )
    );

    if (overlappingSessions.length === 0) {
      // No overlapping sessions, return original slot as available
      return [{
        ...originalSlot,
        is_booked: false,
        updated_at: new Date().toISOString()
      }];
    }

    // Sort sessions by start time
    const sortedSessions = overlappingSessions.sort((a, b) => 
      timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );

    const resultSlots: TrainerAvailability[] = [];
    let currentTime = slotStart;

    for (const session of sortedSessions) {
      const sessionStart = Math.max(slotStart, timeToMinutes(session.start_time));
      const sessionEnd = Math.min(slotEnd, timeToMinutes(session.end_time));

      // Add available slot before session (if any)
      if (currentTime < sessionStart) {
        resultSlots.push({
          ...originalSlot,
          id: `${originalSlot.id}_available_${currentTime}`,
          start_time: minutesToTime(currentTime),
          end_time: minutesToTime(sessionStart),
          is_booked: false,
          updated_at: new Date().toISOString()
        });
      }

      // Add booked slot for session
      resultSlots.push({
        ...originalSlot,
        id: `${originalSlot.id}_booked_${sessionStart}`,
        start_time: minutesToTime(sessionStart),
        end_time: minutesToTime(sessionEnd),
        is_booked: true,
        updated_at: new Date().toISOString()
      });

      currentTime = Math.max(currentTime, sessionEnd);
    }

    // Add remaining available time after last session (if any)
    if (currentTime < slotEnd) {
      resultSlots.push({
        ...originalSlot,
        id: `${originalSlot.id}_available_${currentTime}`,
        start_time: minutesToTime(currentTime),
        end_time: minutesToTime(slotEnd),
        is_booked: false,
        updated_at: new Date().toISOString()
      });
    }

    return resultSlots;
  };

  // Utility functions for time calculations
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Date-based availability functions
  const getDateBasedAvailability = () => {
    const startDate = new Date(currentDate);
    const daysToShow = viewMode === 'week' ? 7 : 30; // Show week or month
    
    // Get start of week/month
    if (viewMode === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    } else {
      startDate.setDate(1); // Start from first day of month
    }

    const dateBasedAvailability = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const currentDateIter = new Date(startDate);
      currentDateIter.setDate(startDate.getDate() + i);
      
      const dayOfWeek = currentDateIter.getDay();
      const dateString = currentDateIter.toISOString().split('T')[0];
      
      // Get availability slots for this day of week
      const daySlots = trainerAvailability.filter(slot => 
        slot.day_of_week === dayOfWeek && slot.is_available
      );
      
      // Get sessions for this specific date
      const daySessions = [...upcomingSessions, ...pastSessions].filter(session =>
        session.date === dateString && 
        (session.status === 'confirmed' || session.status === 'pending')
      );

      dateBasedAvailability.push({
        date: currentDateIter,
        dateString,
        dayOfWeek,
        dayName: currentDateIter.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: currentDateIter.getDate(),
        monthName: currentDateIter.toLocaleDateString('en-US', { month: 'short' }),
        timeSlots: daySlots,
        sessions: daySessions,
        isAvailable: daySlots.length > 0,
        isToday: dateString === new Date().toISOString().split('T')[0],
        isPast: currentDateIter < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }
    
    return dateBasedAvailability;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Message Client Integration
  const handleMessageClient = (session: Session) => {
    if (navigation) {
      // Navigate to the parent tab navigator first, then to the specific screen
      navigation.getParent()?.navigate('Messages', {
        screen: 'TrainerConversation',
        params: {
          participantId: session.client_id,
          participantName: session.client_name,
          participantAvatar: session.client_avatar,
          participantRole: 'client' as const,
        }
      });
    } else {
      // Fallback for demo
      Alert.alert(
        'Message Client',
        `Open conversation with ${session.client_name}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Auto-sync when sessions change
  useEffect(() => {
    syncSessionsWithAvailability();
  }, [upcomingSessions, pastSessions]);

  const sendClientNotification = (clientId: string, clientName: string, message: string, type: 'session_approved' | 'session_declined' | 'session_cancelled' | 'session_rescheduled') => {
    // TODO: Implement real-time client notification via Supabase
    // 1. Insert into messages table with trainer as sender
    // 2. Send push notification via Expo notifications
    // 3. Send email notification via Supabase Edge Functions
    // 4. Update notification_history table for tracking
    
    console.log('📱 Client Notification Sent:', {
      clientId,
      clientName,
      message,
      type,
      timestamp: new Date().toISOString(),
    });

    // Mock notification display for demo
    Alert.alert(
      '📬 Notification Sent',
      `Message sent to ${clientName}:\n\n"${message}"`,
      [{ text: 'OK' }]
    );

    // TODO: Future integration points:
    // - Real-time messaging via Supabase subscriptions
    // - Push notifications with client preference handling
    // - Email templates for different notification types
    // - Notification history and read receipts
    // - Client response handling (confirm/decline reschedule)
  };

  const getFilteredSessions = () => {
    // First, get sessions based on history filter
    let sessions: Session[];
    switch (historyFilter) {
      case 'upcoming':
        sessions = upcomingSessions;
        break;
      case 'past':
        sessions = pastSessions;
        break;
      case 'canceled':
        sessions = canceledSessions;
        break;
      default:
        sessions = upcomingSessions;
    }

    // Then apply session type filter
    if (sessionFilter === 'all') return sessions;
    return sessions.filter(session => session.session_type === sessionFilter);
  };

  // Conflict Detection & Validation
  const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const startTime1 = new Date(`1970-01-01T${start1}:00`).getTime();
    const endTime1 = new Date(`1970-01-01T${end1}:00`).getTime();
    const startTime2 = new Date(`1970-01-01T${start2}:00`).getTime();
    const endTime2 = new Date(`1970-01-01T${end2}:00`).getTime();

    return (startTime1 < endTime2) && (startTime2 < endTime1);
  };

  const checkSessionConflict = (date: string, startTime: string, endTime: string, excludeSessionId?: string): { hasConflict: boolean; conflictingSession?: Session } => {
    const conflictingSession = upcomingSessions.find(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false;
      if (session.date !== date) return false;
      if (session.status === 'cancelled') return false;
      
      return checkTimeOverlap(startTime, endTime, session.start_time, session.end_time);
    });

    return {
      hasConflict: !!conflictingSession,
      conflictingSession,
    };
  };

  const checkAvailabilityConflict = (date: string, startTime: string, endTime: string): { isAvailable: boolean; message?: string } => {
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    
    // Check if trainer is available on this day
    const dayAvailability = trainerAvailability.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.is_available
    );

    if (dayAvailability.length === 0) {
      return {
        isAvailable: false,
        message: 'Trainer is not available on this day of the week',
      };
    }

    // Check if requested time falls within available slots
    const isWithinAvailableTime = dayAvailability.some(slot => {
      const slotStart = new Date(`1970-01-01T${slot.start_time}:00`).getTime();
      const slotEnd = new Date(`1970-01-01T${slot.end_time}:00`).getTime();
      const requestStart = new Date(`1970-01-01T${startTime}:00`).getTime();
      const requestEnd = new Date(`1970-01-01T${endTime}:00`).getTime();

      return requestStart >= slotStart && requestEnd <= slotEnd && !slot.is_booked;
    });

    if (!isWithinAvailableTime) {
      return {
        isAvailable: false,
        message: 'Requested time is outside available hours or already booked',
      };
    }

    return { isAvailable: true };
  };

  const validateSessionRequest = (date: string, startTime: string, endTime: string, excludeSessionId?: string): { isValid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for session conflicts
    const sessionConflict = checkSessionConflict(date, startTime, endTime, excludeSessionId);
    if (sessionConflict.hasConflict) {
      errors.push(`Conflicts with existing session: ${sessionConflict.conflictingSession?.client_name} at ${formatTime(sessionConflict.conflictingSession?.start_time || '')}`);
    }

    // Check availability
    const availabilityCheck = checkAvailabilityConflict(date, startTime, endTime);
    if (!availabilityCheck.isAvailable) {
      errors.push(availabilityCheck.message || 'Time slot not available');
    }

    // Check if it's in the past
    const sessionDateTime = new Date(`${date}T${startTime}:00`);
    const now = new Date();
    if (sessionDateTime <= now) {
      errors.push('Cannot schedule sessions in the past');
    }

    // Check if it's too far in the future (optional business rule)
    const maxAdvanceBooking = new Date();
    maxAdvanceBooking.setMonth(maxAdvanceBooking.getMonth() + 3);
    if (sessionDateTime > maxAdvanceBooking) {
      warnings.push('Session is more than 3 months in advance');
    }

    // Check if it's during reasonable hours
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 6 || hour > 22) {
      warnings.push('Session is outside normal business hours (6 AM - 10 PM)');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  };

  const getSessionTypeIcon = (sessionType: 'personal' | 'group' | 'assessment') => {
    switch (sessionType) {
      case 'personal': return 'person';
      case 'group': return 'people';
      case 'assessment': return 'clipboard';
      default: return 'fitness';
    }
  };

  const getSessionTypeColor = (sessionType: 'personal' | 'group' | 'assessment') => {
    switch (sessionType) {
      case 'personal': return COLORS.primary;
      case 'group': return COLORS.secondary;
      case 'assessment': return COLORS.warning;
      default: return COLORS.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.primary;
      case 'cancelled': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  // Session Action Handlers
  const handleSessionAction = (session: Session, action: 'view' | 'reschedule' | 'cancel') => {
    setSelectedSession(session);
    
    switch (action) {
      case 'view':
        setShowSessionModal(true);
        break;
      case 'reschedule':
        setRescheduleDate(session.date);
        setRescheduleTime(session.start_time);
        setShowRescheduleModal(true);
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Session',
          `Are you sure you want to cancel the session with ${session.client_name}?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes, Cancel',
              style: 'destructive',
              onPress: () => {
                // TODO: Implement Supabase session cancellation
                // Update session status to 'cancelled' and notify client
                const updatedSessions = upcomingSessions.map(s =>
                  s.id === session.id ? { ...s, status: 'cancelled' as const } : s
                );
                setUpcomingSessions(updatedSessions);
                
                // Move to canceled sessions list
                setCanceledSessions(prev => [...prev, { ...session, status: 'cancelled' as const }]);
                
                // Remove from upcoming sessions
                setUpcomingSessions(prev => prev.filter(s => s.id !== session.id));
                
                // Trigger availability sync to unblock the time slot
                setTimeout(syncSessionsWithAvailability, 100);
                
                // Send notification to client
                sendClientNotification(
                  session.client_id,
                  session.client_name,
                  `Your ${session.session_category.toLowerCase()} session on ${formatDate(session.date)} at ${formatTime(session.start_time)} has been cancelled. Please contact your trainer to reschedule.`,
                  'session_cancelled'
                );
              },
            },
          ]
        );
        break;
    }
  };

  const handleRescheduleSubmit = () => {
    if (!selectedSession || !rescheduleDate || !rescheduleTime) {
      Alert.alert('Error', 'Please select both date and time for rescheduling.');
      return;
    }

    // Calculate end time (assuming 1-hour sessions)
    const endTime = (parseInt(rescheduleTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
    
    // Validate new time slot
    const validation = validateSessionRequest(rescheduleDate, rescheduleTime, endTime, selectedSession.id);
    
    if (!validation.isValid) {
      Alert.alert(
        'Scheduling Conflict ⚠️',
        `Cannot reschedule:\n\n${validation.errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      Alert.alert(
        'Schedule Warning',
        `${validation.warnings.join('\n')}\n\nDo you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => executeReschedule() },
        ]
      );
    } else {
      executeReschedule();
    }

    function executeReschedule() {
      if (!selectedSession) return; // Additional safety check
      
      // TODO: Implement Supabase reschedule logic
      // 1. Check for conflicts with new time slot
      // 2. Update session in database
      // 3. Send notification to client
      // 4. Update local state
      
      console.log('Mock: Rescheduling session', {
        sessionId: selectedSession.id,
        clientName: selectedSession.client_name,
        oldDate: selectedSession.date,
        oldTime: selectedSession.start_time,
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        validation,
      });

      // Update local state for demo
      const updatedSessions = upcomingSessions.map(session =>
        session.id === selectedSession.id 
          ? { 
              ...session, 
              date: rescheduleDate,
              start_time: rescheduleTime,
              end_time: endTime
            }
          : session
      );
      setUpcomingSessions(updatedSessions);
      
      // Trigger availability sync to update blocked time slots
      setTimeout(syncSessionsWithAvailability, 100);
      
      setShowRescheduleModal(false);
      
      // Send notification to client
      sendClientNotification(
        selectedSession.client_id,
        selectedSession.client_name,
        `Your ${selectedSession.session_category.toLowerCase()} session has been rescheduled to ${formatDate(rescheduleDate)} at ${formatTime(rescheduleTime)}. Please confirm this new time works for you.`,
        'session_rescheduled'
      );
      
      setSelectedSession(null);
    }
  };

  const handleRequestAction = (request: SessionRequest, action: 'approve' | 'decline') => {
    Alert.alert(
      action === 'approve' ? 'Approve Session Request' : 'Decline Session Request',
      `${action === 'approve' ? 'Approve' : 'Decline'} session request from ${request.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Decline',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: () => {
            // TODO: Implement Supabase session request handling
            // Update request status and create session if approved
            const updatedRequests = sessionRequests.map(r =>
              r.id === request.id 
                ? { ...r, status: action === 'approve' ? 'approved' as const : 'declined' as const }
                : r
            );
            setSessionRequests(updatedRequests);
            
            if (action === 'approve') {
              // Validate before creating session
              const endTime = (parseInt(request.requested_time.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
              const validation = validateSessionRequest(request.requested_date, request.requested_time, endTime);
              
              if (!validation.isValid) {
                Alert.alert(
                  'Cannot Approve Request ⚠️',
                  `Scheduling conflict detected:\n\n${validation.errors.join('\n')}\n\nPlease contact the client to suggest alternative times.`,
                  [{ text: 'OK' }]
                );
                return;
              }

              // Create new session from approved request
              const newSession: Session = {
                id: `session_${Date.now()}`,
                client_id: request.client_id,
                client_name: request.client_name,
                client_avatar: request.client_avatar,
                session_type: request.session_type,
                session_category: request.session_category,
                date: request.requested_date,
                start_time: request.requested_time,
                end_time: endTime,
                status: 'confirmed',
                location: 'TBD',
                notes: request.message,
                program_id: '',
                program_name: '',
              };
              setUpcomingSessions([...upcomingSessions, newSession]);
              
              // Trigger availability sync to block the new session time
              setTimeout(syncSessionsWithAvailability, 100);
              
              // Send approval notification
              let approvalMessage = `Great news! Your ${request.session_category.toLowerCase()} session request for ${formatDate(request.requested_date)} at ${formatTime(request.requested_time)} has been approved. See you then!`;
              
              if (validation.warnings.length > 0) {
                approvalMessage += `\n\nNote: ${validation.warnings.join(' ')}`;
              }
              
              sendClientNotification(
                request.client_id,
                request.client_name,
                approvalMessage,
                'session_approved'
              );
            } else {
              // Send decline notification
              sendClientNotification(
                request.client_id,
                request.client_name,
                `Unfortunately, your ${request.session_category.toLowerCase()} session request for ${formatDate(request.requested_date)} at ${formatTime(request.requested_time)} cannot be accommodated. Please try selecting a different time or contact me directly.`,
                'session_declined'
              );
            }
            
            Alert.alert(
              'Request Updated',
              `Session request has been ${action === 'approve' ? 'approved' : 'declined'}.`
            );
          },
        },
      ]
    );
  };

  const toggleDayAvailability = (dayIndex: number) => {
    // Update Supabase format (primary data source)
    const updatedSupabaseAvailability = trainerAvailability.map(slot =>
      slot.day_of_week === dayIndex 
        ? { ...slot, is_available: !slot.is_available, updated_at: new Date().toISOString() }
        : slot
    );
    setTrainerAvailability(updatedSupabaseAvailability);
    
    // Legacy format will be updated automatically via useEffect
    
    // TODO: Implement Supabase availability update
    // await supabase.from('trainer_availability')
    //   .update({ 
    //     is_available: !currentAvailability,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('trainer_id', currentTrainerId)
    //   .eq('day_of_week', dayIndex);
    
    console.log('📅 Availability Updated:', {
      dayIndex,
      updatedSlots: updatedSupabaseAvailability.filter(slot => slot.day_of_week === dayIndex),
      timestamp: new Date().toISOString(),
    });
  };

  // Enhanced Availability Management Functions
  const addTimeSlot = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setSelectedTimeSlot(null);
    setNewStartTime('09:00');
    setNewEndTime('10:00');
    setShowTimePickerModal(true);
  };

  const editTimeSlot = (dayIndex: number, slotIndex: number, slot: TimeSlot) => {
    setSelectedDay(dayIndex);
    setSelectedTimeSlot(slotIndex);
    setNewStartTime(slot.start);
    setNewEndTime(slot.end);
    setShowTimePickerModal(true);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              timeSlots: day.timeSlots.filter((_, index) => index !== slotIndex)
            }
          : day
      )
    );
  };

  const saveTimeSlot = () => {
    if (!newStartTime || !newEndTime || selectedDay === null) return;

    // Validate time slot
    if (newStartTime >= newEndTime) {
      Alert.alert('Invalid Time', 'Start time must be before end time');
      return;
    }

    const newSlot: TimeSlot = {
      start: newStartTime,
      end: newEndTime,
      isBooked: false
    };

    setWeeklyAvailability(prev =>
      prev.map(day =>
        day.dayIndex === selectedDay
          ? {
              ...day,
              timeSlots: selectedTimeSlot !== null
                ? day.timeSlots.map((slot, index) =>
                    index === selectedTimeSlot ? newSlot : slot
                  )
                : [...day.timeSlots, newSlot].sort((a, b) => a.start.localeCompare(b.start))
            }
          : day
      )
    );

    setShowTimePickerModal(false);
    setSelectedDay(null);
    setSelectedTimeSlot(null);
  };

  const saveAvailabilityChanges = () => {
    // TODO: Sync with Supabase trainer_availability table
    Alert.alert(
      'Availability Updated', 
      'Your weekly availability has been saved successfully.',
      [{ text: 'OK', onPress: () => setEditingAvailability(false) }]
    );
  };

  // Component Renderers
  const HistoryFilterBar: React.FC = () => (
    <View style={styles.historyFilterContainer}>
      {[
        { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
        { key: 'past', label: 'Past', icon: 'checkmark-circle-outline' },
        { key: 'canceled', label: 'Canceled', icon: 'close-circle-outline' }
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.historyFilterButton,
            historyFilter === filter.key && styles.activeHistoryFilterButton
          ]}
          onPress={() => setHistoryFilter(filter.key as any)}
        >
          <Ionicons 
            name={filter.icon as any} 
            size={18} 
            color={historyFilter === filter.key ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[
            styles.historyFilterText,
            { color: historyFilter === filter.key ? COLORS.primary : COLORS.text.secondary }
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SessionFilterBar: React.FC = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { key: 'all', label: 'All Sessions', icon: 'fitness' },
          { key: 'personal', label: 'Personal', icon: 'person' },
          { key: 'group', label: 'Group', icon: 'people' },
          { key: 'assessment', label: 'Assessment', icon: 'clipboard' }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              sessionFilter === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setSessionFilter(filter.key as any)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={sessionFilter === filter.key ? 'white' : COLORS.text.secondary} 
            />
            <Text style={[
              styles.filterButtonText,
              { color: sessionFilter === filter.key ? 'white' : COLORS.text.secondary }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const SessionCard: React.FC<{ session: Session }> = ({ session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionAction(session, 'view')}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionTitleRow}>
            <Text style={styles.clientName}>{session.client_name}</Text>
            <View style={[
              styles.sessionTypeIndicator,
              { backgroundColor: getSessionTypeColor(session.session_type) }
            ]}>
              <Ionicons 
                name={getSessionTypeIcon(session.session_type) as any} 
                size={12} 
                color="white" 
              />
            </View>
          </View>
          <Text style={styles.sessionType}>{session.session_category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{session.status}</Text>
        </View>
      </View>
      
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>{formatDate(session.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>
            {formatTime(session.start_time)} - {formatTime(session.end_time)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>{session.location}</Text>
        </View>
      </View>

      {session.status === 'confirmed' && (
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => handleMessageClient(session)}
          >
            <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
            <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => handleSessionAction(session, 'reschedule')}
          >
            <Ionicons name="calendar" size={16} color={COLORS.primary} />
            <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleSessionAction(session, 'cancel')}
          >
            <Ionicons name="close-circle" size={16} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const RequestCard: React.FC<{ request: SessionRequest }> = ({ request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <View style={styles.sessionTitleRow}>
            <Text style={styles.clientName}>{request.client_name}</Text>
            <View style={[
              styles.sessionTypeIndicator,
              { backgroundColor: getSessionTypeColor(request.session_type) }
            ]}>
              <Ionicons 
                name={getSessionTypeIcon(request.session_type) as any} 
                size={12} 
                color="white" 
              />
            </View>
          </View>
          <Text style={styles.requestTime}>
            {formatDate(request.requested_date)} at {formatTime(request.requested_time)}
          </Text>
        </View>
        <Text style={styles.requestAge}>{getRelativeTime(request.created_at)}</Text>
      </View>
      
      <Text style={styles.sessionType}>{request.session_category}</Text>
      {request.message && (
        <Text style={styles.requestMessage}>"{request.message}"</Text>
      )}
      
      {request.status === 'pending' && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequestAction(request, 'approve')}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleRequestAction(request, 'decline')}
          >
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const DateBasedAvailabilityCard: React.FC<{ dayData: any }> = ({ dayData }) => (
    <View style={[
      styles.dateAvailabilityCard,
      dayData.isPast && styles.pastDateCard,
      dayData.isToday && styles.todayDateCard
    ]}>
      <View style={styles.dateHeader}>
        <View style={styles.dateInfo}>
          <Text style={[
            styles.dateText,
            dayData.isToday && styles.todayText
          ]}>
            {dayData.dayName}, {dayData.monthName} {dayData.dayNumber}
          </Text>
          {dayData.isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
        </View>
        
        {!dayData.isPast && (
          <TouchableOpacity
            style={[
              styles.availabilityToggle,
              { backgroundColor: dayData.isAvailable ? COLORS.success : COLORS.text.secondary }
            ]}
            onPress={() => toggleDayAvailability(dayData.dayOfWeek)}
          >
            <Text style={styles.toggleText}>
              {dayData.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Show sessions for this date */}
      {dayData.sessions.length > 0 && (
        <View style={styles.daySessionsContainer}>
          <Text style={styles.daySessionsLabel}>Sessions:</Text>
          {dayData.sessions.map((session: Session) => (
            <View key={session.id} style={styles.daySessionCard}>
              <Text style={styles.daySessionText}>
                {formatTime(session.start_time)}-{formatTime(session.end_time)} • {session.client_name}
              </Text>
              <Text style={styles.daySessionType}>{session.session_category}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Show availability slots */}
      {dayData.isAvailable && dayData.timeSlots.length > 0 && (
        <View style={styles.timeSlots}>
          {dayData.timeSlots.map((slot: any, index: number) => (
            <View
              key={index}
              style={[
                styles.timeSlot,
                { backgroundColor: slot.is_booked ? '#ffe6e6' : '#e6f7e6' }
              ]}
            >
              <View style={styles.timeSlotInfo}>
                <Text style={styles.timeSlotText}>
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </Text>
                <View style={styles.timeSlotStatusContainer}>
                  {slot.is_booked ? (
                    <View style={styles.bookedSlotInfo}>
                      <Text style={[styles.timeSlotStatus, { color: COLORS.error }]}>
                        Booked by Session
                      </Text>
                      <Ionicons name="calendar" size={12} color={COLORS.error} />
                    </View>
                  ) : (
                    <Text style={[styles.timeSlotStatus, { color: COLORS.success }]}>
                      Available for Booking
                    </Text>
                  )}
                </View>
              </View>
              
              {editingAvailability && !slot.is_booked && !dayData.isPast && (
                <View style={styles.timeSlotActions}>
                  <TouchableOpacity
                    style={styles.editTimeButton}
                    onPress={() => editTimeSlot(dayData.dayOfWeek, index, slot)}
                  >
                    <Ionicons name="pencil" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => removeTimeSlot(dayData.dayOfWeek, index)}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          
          {editingAvailability && !dayData.isPast && (
            <TouchableOpacity
              style={styles.addTimeSlotButton}
              onPress={() => addTimeSlot(dayData.dayOfWeek)}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text style={styles.addTimeSlotText}>Add Time Slot</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const AvailabilityCard: React.FC<{ day: WeeklyAvailability }> = ({ day }) => (
    <View style={styles.availabilityCard}>
      <View style={styles.availabilityHeader}>
        <Text style={styles.dayName}>{day.day}</Text>
        <TouchableOpacity
          style={[
            styles.availabilityToggle,
            { backgroundColor: day.isAvailable ? COLORS.success : COLORS.text.secondary }
          ]}
          onPress={() => toggleDayAvailability(day.dayIndex)}
        >
          <Text style={styles.toggleText}>
            {day.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {day.isAvailable && (
        <View style={styles.timeSlots}>
          {day.timeSlots.map((slot, index) => (
            <View
              key={index}
              style={[
                styles.timeSlot,
                { backgroundColor: slot.isBooked ? '#ffe6e6' : '#e6f7e6' }
              ]}
            >
              <View style={styles.timeSlotInfo}>
                <Text style={styles.timeSlotText}>
                  {formatTime(slot.start)} - {formatTime(slot.end)}
                </Text>
                <View style={styles.timeSlotStatusContainer}>
                  {slot.isBooked ? (
                    <View style={styles.bookedSlotInfo}>
                      <Text style={[styles.timeSlotStatus, { color: COLORS.error }]}>
                        Booked by Session
                      </Text>
                      <Ionicons name="calendar" size={12} color={COLORS.error} />
                    </View>
                  ) : (
                    <Text style={[styles.timeSlotStatus, { color: COLORS.success }]}>
                      Available for Booking
                    </Text>
                  )}
                </View>
              </View>
              
              {editingAvailability && !slot.isBooked && (
                <View style={styles.timeSlotActions}>
                  <TouchableOpacity
                    style={styles.editTimeButton}
                    onPress={() => editTimeSlot(day.dayIndex, index, slot)}
                  >
                    <Ionicons name="pencil" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => removeTimeSlot(day.dayIndex, index)}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          
          {editingAvailability && (
            <TouchableOpacity
              style={styles.addTimeSlotButton}
              onPress={() => addTimeSlot(day.dayIndex)}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text style={styles.addTimeSlotText}>Add Time Slot</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  // Tab Content Renderers
  const renderSessions = () => {
    const filteredSessions = getFilteredSessions();
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTrainerData.scheduleStats.thisWeekSessions}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTrainerData.scheduleStats.confirmedSessions}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTrainerData.scheduleStats.utilizationRate}%</Text>
            <Text style={styles.statLabel}>Utilization</Text>
          </View>
        </View>

        <HistoryFilterBar />
        <SessionFilterBar />

        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={historyFilter === 'upcoming' ? "calendar-outline" : historyFilter === 'past' ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={64} 
              color={COLORS.text.secondary} 
            />
            <Text style={styles.emptyStateText}>
              {sessionFilter === 'all' 
                ? `No ${historyFilter} sessions` 
                : `No ${sessionFilter} ${historyFilter} sessions`
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {historyFilter === 'upcoming' && sessionFilter === 'all' 
                ? 'Your schedule is clear for now'
                : historyFilter === 'past' && sessionFilter === 'all'
                ? 'No completed sessions yet'
                : historyFilter === 'canceled' && sessionFilter === 'all'
                ? 'No canceled sessions'
                : 'Try selecting a different filter'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderRequests = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.requestsHeader}>
        <Text style={styles.requestsTitle}>
          {sessionRequests.filter(r => r.status === 'pending').length} Pending Requests
        </Text>
        <Text style={styles.requestsSubtitle}>
          Review and respond to client session requests
        </Text>
      </View>

      {sessionRequests.length > 0 ? (
        sessionRequests
          .filter(r => r.status === 'pending')
          .map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={64} color={COLORS.text.secondary} />
          <Text style={styles.emptyStateText}>No pending requests</Text>
          <Text style={styles.emptyStateSubtext}>All session requests have been handled</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderAvailability = () => {
    const dateBasedData = getDateBasedAvailability();
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.availabilitySettings}>
          <View style={styles.availabilityTopHeader}>
            <View>
              <Text style={styles.availabilityTitle}>Availability Calendar</Text>
              <Text style={styles.availabilitySubtitle}>
                Manage your training hours by date
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, editingAvailability && styles.editingButton]}
              onPress={() => setEditingAvailability(!editingAvailability)}
            >
              <Ionicons 
                name={editingAvailability ? "checkmark" : "create"} 
                size={18} 
                color={editingAvailability ? "white" : COLORS.primary} 
              />
              <Text style={[
                styles.editButtonText,
                { color: editingAvailability ? "white" : COLORS.primary }
              ]}>
                {editingAvailability ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'week' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('week')}
            >
              <Text style={[
                styles.viewModeText,
                { color: viewMode === 'week' ? 'white' : COLORS.primary }
              ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'month' && styles.activeViewModeButton
              ]}
              onPress={() => setViewMode('month')}
            >
              <Text style={[
                styles.viewModeText,
                { color: viewMode === 'month' ? 'white' : COLORS.primary }
              ]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateNavigationControls}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateDate('prev')}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.currentDateContainer}>
              <Text style={styles.currentDateText}>
                {viewMode === 'week' 
                  ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </Text>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={goToToday}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateDate('next')}
            >
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date-based Availability Cards */}
        {dateBasedData.map((dayData) => (
          <DateBasedAvailabilityCard key={dayData.dateString} dayData={dayData} />
        ))}

        {editingAvailability && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveAvailabilityChanges}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Schedule" />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === 'sessions' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sessions' ? COLORS.primary : COLORS.text.secondary }
          ]}>
            Sessions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Ionicons 
            name="mail" 
            size={20} 
            color={activeTab === 'requests' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'requests' ? COLORS.primary : COLORS.text.secondary }
          ]}>
            Requests
          </Text>
          {sessionRequests.filter(r => r.status === 'pending').length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {sessionRequests.filter(r => r.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
          onPress={() => setActiveTab('availability')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={activeTab === 'availability' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'availability' ? COLORS.primary : COLORS.text.secondary }
          ]}>
            Availability
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'sessions' && renderSessions()}
      {activeTab === 'requests' && renderRequests()}
      {activeTab === 'availability' && renderAvailability()}

      {/* Session Detail Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Session Details</Text>
            <TouchableOpacity onPress={() => setShowSessionModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {selectedSession && (
            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>{selectedSession.client_name}</Text>
              <Text style={styles.modalText}>{selectedSession.session_type}</Text>
              <Text style={styles.modalText}>
                {formatDate(selectedSession.date)} at {formatTime(selectedSession.start_time)}
              </Text>
              <Text style={styles.modalText}>Location: {selectedSession.location}</Text>
              {selectedSession.notes && (
                <Text style={styles.modalNotes}>Notes: {selectedSession.notes}</Text>
              )}
              
              {/* TODO: Add session management features
                  - Edit session details
                  - Add session notes
                  - Mark as completed
                  - Integration with client programs
              */}
            </View>
          )}
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reschedule Session</Text>
            <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {selectedSession && (
            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>
                {selectedSession.client_name} - {selectedSession.session_category}
              </Text>
              
              <Text style={styles.currentTimeLabel}>Current Time:</Text>
              <Text style={styles.currentTimeText}>
                {formatDate(selectedSession.date)} at {formatTime(selectedSession.start_time)}
              </Text>

              <View style={styles.rescheduleForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Date</Text>
                  <TouchableOpacity style={styles.dateTimeInput}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.text.secondary} />
                    <TextInput
                      style={styles.dateTimeText}
                      placeholder="YYYY-MM-DD"
                      value={rescheduleDate}
                      onChangeText={setRescheduleDate}
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    Format: YYYY-MM-DD (e.g., 2025-10-20)
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Time</Text>
                  <TouchableOpacity style={styles.dateTimeInput}>
                    <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                    <TextInput
                      style={styles.dateTimeText}
                      placeholder="HH:MM"
                      value={rescheduleTime}
                      onChangeText={setRescheduleTime}
                      placeholderTextColor={COLORS.text.secondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    Format: 24-hour time (e.g., 14:30)
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => setShowRescheduleModal(false)}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={handleRescheduleSubmit}
                >
                  <Ionicons name="calendar" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Submit Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  The client will be automatically notified of the schedule change via the app and email.
                </Text>
              </View>
              
              {/* TODO: Add enhanced rescheduling features
                  - Visual calendar picker
                  - Available time slot suggestions
                  - Conflict detection with other sessions
                  - Bulk rescheduling for recurring sessions
                  - Client preference integration
              */}
            </View>
          )}
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTimeSlot !== null ? 'Edit Time Slot' : 'Add Time Slot'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTimePickerModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedDay !== null ? `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDay]}` : ''} Availability
              </Text>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                    placeholder="09:00"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                    placeholder="10:00"
                  />
                </View>
              </View>

              <Text style={styles.helperText}>
                Use 24-hour format (e.g., 09:00, 14:30)
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setShowTimePickerModal(false)}
              >
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={saveTimeSlot}
              >
                <Ionicons name="time" size={16} color="white" />
                <Text style={styles.actionButtonText}>
                  {selectedTimeSlot !== null ? 'Update' : 'Add'} Time Slot
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyFilterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  historyFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeHistoryFilterButton: {
    backgroundColor: '#f0f7ff',
  },
  historyFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sessionTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  messageButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
  },
  requestTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  requestAge: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  requestMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  requestsHeader: {
    marginBottom: 20,
  },
  requestsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  requestsSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  availabilityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  availabilityToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlots: {
    gap: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  timeSlotStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlotStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookedSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editTimeButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
  },
  removeTimeButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#ffe6e6',
  },
  addTimeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 6,
  },
  addTimeSlotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  availabilitySettings: {
    marginBottom: 20,
  },
  availabilityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  availabilityTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  editingButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  modalNotes: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginTop: 12,
  },
  // Reschedule Modal Styles
  currentTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  currentTimeText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  rescheduleForm: {
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    flex: 1,
  },
  secondaryButtonText: {
    color: COLORS.text.secondary,
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  // Date-based Availability Styles
  dateAvailabilityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  pastDateCard: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  todayDateCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  todayText: {
    color: COLORS.primary,
  },
  todayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  daySessionsContainer: {
    marginBottom: 12,
  },
  daySessionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  daySessionCard: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  daySessionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  daySessionType: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  // Date Navigation Styles
  dateNavigation: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeViewModeButton: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateNavigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
  },
  currentDateContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  currentDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  todayButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrainerScheduleScreen;