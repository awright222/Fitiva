/**
 * Trainer Messages Screen - Inbox view for trainers
 * 
 * Features:
 * - List of conversations with all clients
 * - Unread message indicators
 * - Client selection and management
 * - Large, accessible UI for seniors
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Client Conversations:
 *    - Replace mock data with: supabase.from('conversations_view').select().eq('trainer_id', trainerId)
 *    - Show all clients the trainer is assigned to
 * 
 * 2. Real-time Updates:
 *    - Subscribe to new messages from all clients
 *    - Update unread counts and conversation order
 * 
 * 3. Client Management:
 *    - Load trainer's assigned clients
 *    - Allow initiating conversations with new clients
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ConversationList } from '../components';
import { SectionHeader } from '../../../components/ui';
import type { Conversation } from '../types';
import { getConversations } from '../data/mockData';
import { useAuth } from '../../../context/AuthContext';

// TODO: Import proper navigation types
type TrainerMessagesScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Colors for consistent styling
const colors = {
  primary: '#2563eb',
  gray: {
    100: '#f3f4f6',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

export const TrainerMessagesScreen: React.FC<TrainerMessagesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Replace with Supabase real-time subscription
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // TODO: Replace with: supabase.from('conversations_view').select().eq('trainer_id', user.id)
  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Mock trainer ID for demonstration (replace with real auth)
      const trainerId = user?.id || '2'; // Default to trainer user for demo
      
      // TODO: When REALTIME_ENABLED in feature flags:
      // const { data, error } = await supabase
      //   .from('conversations_view')
      //   .select('*')
      //   .eq('trainer_id', trainerId)
      //   .order('updated_at', { ascending: false });
      
      const trainerConversations = getConversations(trainerId);
      setConversations(trainerConversations);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert(
        'Error',
        'Unable to load your messages. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    // Navigate to individual conversation screen
    navigation.navigate('TrainerConversation', {
      participantId: conversation.participant_id,
      participantName: conversation.participant_name,
      participantAvatar: conversation.participant_avatar,
      participantRole: conversation.participant_role,
    });
  };

  const handleNewMessagePress = () => {
    // TODO: Navigate to client selection screen or implement client picker
    // For now, show an alert with future functionality
    Alert.alert(
      'New Message',
      'Client selection feature coming soon! For now, clients can initiate conversations.',
      [{ text: 'OK' }]
    );
  };

  // TODO: Add real-time subscription when component mounts
  // useEffect(() => {
  //   if (!user?.id) return;
  //   
  //   const subscription = supabase
  //     .channel('trainer_conversations')
  //     .on('postgres_changes', {
  //       event: '*',
  //       schema: 'public',
  //       table: 'messages',
  //       filter: `receiver_id=eq.${user.id}`,
  //     }, (payload) => {
  //       // Refresh conversations when new message received
  //       loadConversations();
  //     })
  //     .subscribe();
  //   
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [user?.id]);

  // Calculate total unread messages
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  if (loading) {
    // TODO: Use proper loading component
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <SectionHeader title="Client Messages" />
          {/* TODO: Add LoadingScreen component */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SectionHeader 
          title="Client Messages" 
          subtitle={
            conversations.length > 0 
              ? `${conversations.length} client${conversations.length !== 1 ? 's' : ''}${totalUnreadCount > 0 ? ` • ${totalUnreadCount} unread` : ''}`
              : undefined
          }
          actionText="New"
          onActionPress={handleNewMessagePress}
        />
        
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No client messages yet</Text>
            <Text style={styles.emptyStateDescription}>
              When your clients send you messages, they'll appear here. You can respond to questions, 
              provide guidance, and keep your clients motivated!
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleNewMessagePress}
            >
              <Text style={styles.emptyStateButtonText}>Start a Conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ConversationList
            conversations={conversations}
            onConversationPress={handleConversationPress}
            emptyMessage="No client conversations yet"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  } as ViewStyle,
  
  content: {
    flex: 1,
  } as ViewStyle,
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  } as ViewStyle,
  
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  
  emptyStateDescription: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
  } as TextStyle,
  
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  emptyStateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  } as TextStyle,
});