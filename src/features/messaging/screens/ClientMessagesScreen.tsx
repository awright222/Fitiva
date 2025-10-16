/**
 * Client Messages Screen - Inbox view for clients
 * 
 * Features:
 * - List of conversations with trainers
 * - Unread message indicators
 * - Large touch targets for seniors
 * - Easy navigation to individual conversations
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Real-time Conversations:
 *    - Replace mock data with: supabase.from('conversations_view').select().eq('client_id', clientId)
 *    - Add real-time subscription: supabase.channel('conversations').on('UPDATE', callback)
 * 
 * 2. Message Notifications:
 *    - Subscribe to new messages: supabase.channel('messages').on('INSERT', callback)
 *    - Update unread counts in real-time
 * 
 * 3. User Authentication:
 *    - Get current user ID from auth context
 *    - Filter conversations by authenticated user
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ConversationList } from '../components';
import { SectionHeader } from '../../../components/ui';
import type { Conversation } from '../types';
import { getConversations } from '../data/mockData';
import { useAuth } from '../../../context/AuthContext';

// TODO: Import proper navigation types
type ClientMessagesScreenProps = {
  navigation: StackNavigationProp<any>;
};

export const ClientMessagesScreen: React.FC<ClientMessagesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Replace with Supabase real-time subscription
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // TODO: Replace with: supabase.from('conversations_view').select().eq('client_id', user.id)
  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Mock user ID for demonstration (replace with real auth)
      const userId = user?.id || '1'; // Default to client user for demo
      
      // TODO: When REALTIME_ENABLED in feature flags:
      // const { data, error } = await supabase
      //   .from('conversations_view')
      //   .select('*')
      //   .eq('client_id', userId)
      //   .order('updated_at', { ascending: false });
      
      const mockConversations = getConversations(userId);
      setConversations(mockConversations);
      
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
    navigation.navigate('ClientConversation', {
      participantId: conversation.participant_id,
      participantName: conversation.participant_name,
      participantAvatar: conversation.participant_avatar,
    });
  };

  // TODO: Add real-time subscription when component mounts
  // useEffect(() => {
  //   if (!user?.id) return;
  //   
  //   const subscription = supabase
  //     .channel('client_conversations')
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

  if (loading) {
    // TODO: Use proper loading component
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <SectionHeader title="Messages" />
          {/* TODO: Add LoadingScreen component */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SectionHeader 
          title="Messages" 
          subtitle={conversations.length > 0 ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}` : undefined}
        />
        
        <ConversationList
          conversations={conversations}
          onConversationPress={handleConversationPress}
          emptyMessage="No messages yet. Your trainer will reach out to you here!"
        />
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
});