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
import { useFocusEffect } from '@react-navigation/native';

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

  // Refresh conversations when screen comes into focus (e.g., after sending a new message)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 ClientMessagesScreen useFocusEffect triggered');
      console.log('🔍 User object:', user);
      console.log('🔍 User ID:', user?.id);
      console.log('🔍 User profile:', user ? { id: user.id, email: user.email, metadata: user.user_metadata } : 'null');
      
      if (user?.id) {
        console.log('✅ User authenticated, refreshing conversations for:', user.id);
        // Force refresh conversations
        const refreshConversations = async () => {
          try {
            setLoading(true);
            const userId = user.id;
            console.log('📞 Calling getConversations for userId:', userId);
            
            // Add small delay to ensure any pending message operations complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const mockConversations = getConversations(userId);
            console.log('📋 Raw conversations returned:', mockConversations);
            console.log('📊 Number of conversations:', mockConversations.length);
            
            // Force a state update by creating new array reference
            setConversations([...mockConversations]);
            console.log('✅ Conversations state updated with new array reference');
            
            // Force another small delay to ensure UI updates
            setTimeout(() => {
              console.log('🔄 Secondary state check - conversations length:', mockConversations.length);
            }, 200);
            
          } catch (error) {
            console.error('❌ Error refreshing conversations:', error);
          } finally {
            setLoading(false);
          }
        };
        refreshConversations();
      } else {
        console.log('❌ No user ID available, cannot load conversations');
      }
    }, [user?.id])
  );

  // TODO: Replace with: supabase.from('conversations_view').select().eq('client_id', user.id)
  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Mock user ID for demonstration (replace with real auth)
      const userId = user?.id || '1'; // Default to client user for demo
      
      console.log('📞 loadConversations called for userId:', userId);
      
      // TODO: When REALTIME_ENABLED in feature flags:
      // const { data, error } = await supabase
      //   .from('conversations_view')
      //   .select('*')
      //   .eq('client_id', userId)
      //   .order('updated_at', { ascending: false });
      
      const mockConversations = getConversations(userId);
      console.log('📋 loadConversations got:', mockConversations.length, 'conversations');
      setConversations(mockConversations);
      console.log('✅ Conversations state set in loadConversations');
      
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

  const handleStartNewConversation = () => {
    // Navigate to trainer selection screen
    navigation.navigate('SelectTrainer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SectionHeader 
          title="Messages" 
          subtitle={conversations.length > 0 ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}` : undefined}
          actionText="New Message"
          onActionPress={handleStartNewConversation}
        />
        
        <ConversationList
          conversations={conversations}
          onConversationPress={handleConversationPress}
          emptyMessage="No messages yet. Tap 'New Message' to start a conversation with your trainer!"
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