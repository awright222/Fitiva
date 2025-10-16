/**
 * Trainer Conversation Screen - Individual chat view with client
 * 
 * Features:
 * - Real-time chat interface with specific client
 * - Message history and context
 * - Professional messaging interface
 * - Client information display
 * - Large, accessible UI optimized for trainers
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Message Loading:
 *    - Replace mock data with: supabase.from('messages').select().match({ trainer_client_conversation })
 *    - Add pagination for long conversation histories
 * 
 * 2. Real-time Messages:
 *    - Subscribe to new messages from client
 *    - Auto-scroll and notification handling
 *    - Typing indicators for better UX
 * 
 * 3. Professional Features:
 *    - Message templates for common responses
 *    - Quick replies for scheduling/motivation
 *    - File/image sharing capabilities
 * 
 * 4. Client Context:
 *    - Load client profile information
 *    - Show recent session history
 *    - Display client goals and progress
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextStyle,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { MessageBubble, MessageComposer } from '../components';
import { SectionHeader } from '../../../components/ui';
import type { Message } from '../types';
import { 
  getMessages, 
  sendMessage, 
  markConversationAsRead 
} from '../data/mockData';
import { useAuth } from '../../../context/AuthContext';

// TODO: Import proper navigation types
type TrainerConversationScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

// Colors for consistent styling
const colors = {
  primary: '#2563eb',
  gray: {
    100: '#f3f4f6',
    600: '#4b5563',
    900: '#111827',
  },
  green: {
    100: '#dcfce7',
    600: '#16a34a',
  },
  white: '#ffffff',
} as const;

export const TrainerConversationScreen: React.FC<TrainerConversationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const { participantId, participantName, participantAvatar, participantRole } = route.params || {};
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // TODO: Replace with Supabase real-time subscription
  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
  }, [user?.id, participantId]);

  // TODO: Replace with: supabase.from('messages').select().or(`and(sender_id.eq.${userId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${userId})`)
  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Mock trainer ID for demonstration (replace with real auth)
      const trainerId = user?.id || '2'; // Default to trainer user for demo
      
      // TODO: When implementing Supabase:
      // const { data, error } = await supabase
      //   .from('messages')
      //   .select('*')
      //   .or(`and(sender_id.eq.${trainerId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${trainerId})`)
      //   .order('created_at', { ascending: true });
      
      const conversationMessages = getMessages(trainerId, participantId);
      setMessages(conversationMessages);
      
      // Auto-scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert(
        'Error',
        'Unable to load conversation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace with: supabase.from('messages').update({ read_at: new Date() }).eq('sender_id', participantId).eq('receiver_id', trainerId).is('read_at', null)
  const markMessagesAsRead = () => {
    const trainerId = user?.id || '2';
    markConversationAsRead(trainerId, participantId);
  };

  // TODO: Replace with Supabase real-time subscription
  // useEffect(() => {
  //   if (!user?.id) return;
  //   
  //   const subscription = supabase
  //     .channel('trainer_conversation')
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'messages',
  //       filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id}))`,
  //     }, (payload) => {
  //       const newMessage = payload.new as Message;
  //       setMessages(prev => [...prev, newMessage]);
  //       
  //       // Auto-scroll to new message
  //       setTimeout(() => {
  //         flatListRef.current?.scrollToEnd({ animated: true });
  //       }, 100);
  //       
  //       // Mark as read if received from client
  //       if (newMessage.sender_id === participantId) {
  //         markMessageAsRead(newMessage.id);
  //       }
  //     })
  //     .subscribe();
  //   
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [user?.id, participantId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      
      const trainerId = user?.id || '2';
      const messageContent = messageText.trim();
      
      // Clear input immediately for better UX
      setMessageText('');
      
      // TODO: Replace with Supabase insert
      // const { data, error } = await supabase
      //   .from('messages')
      //   .insert({
      //     sender_id: trainerId,
      //     receiver_id: participantId,
      //     content: messageContent,
      //   })
      //   .select()
      //   .single();
      
      const newMessage = sendMessage({
        sender_id: trainerId,
        receiver_id: participantId,
        content: messageContent,
      });
      
      // Add message to local state (optimistic update)
      setMessages(prev => [...prev, newMessage]);
      
      // Auto-scroll to new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Restore message text on error
      setMessageText(messageText);
      
      Alert.alert(
        'Error',
        'Unable to send message. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  // TODO: Add quick reply templates for trainers
  const handleQuickReply = (template: string) => {
    setMessageText(template);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const trainerId = user?.id || '2';
    const isOwnMessage = item.sender_id === trainerId;
    
    // Show timestamp for first message, or if significant time gap
    const showTimestamp = index === 0 || 
      (index > 0 && 
       new Date(item.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 // 5 minutes
      );

    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showTimestamp={showTimestamp}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <SectionHeader 
            title={participantName}
            subtitle={`Client • ${participantAvatar}`}
          />
          
          {/* TODO: Add client context information */}
          <View style={styles.clientInfo}>
            <Text style={styles.clientInfoText}>
              💪 Active client • Next session: Tomorrow 3 PM
            </Text>
          </View>
        </View>
        
        <View style={styles.messagesContainer}>
          {loading ? (
            // TODO: Add proper loading state
            <View style={styles.loadingContainer}>
              {/* LoadingScreen component would go here */}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => {
                // Auto-scroll to bottom when content changes
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />
          )}
        </View>
        
        {/* TODO: Add quick reply templates */}
        {/* <View style={styles.quickReplies}>
          <TouchableOpacity onPress={() => handleQuickReply("Great job today! Keep up the excellent work! 💪")}>
            <Text>Encouragement</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickReply("Let's schedule your next session. What times work best for you?")}>
            <Text>Schedule</Text>
          </TouchableOpacity>
        </View> */}
        
        <MessageComposer
          value={messageText}
          onChangeText={setMessageText}
          onSend={handleSendMessage}
          placeholder={`Message ${participantName}...`}
          disabled={sending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  } as ViewStyle,
  
  keyboardContainer: {
    flex: 1,
  } as ViewStyle,
  
  header: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  } as ViewStyle,
  
  clientInfo: {
    backgroundColor: colors.green[100],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  } as ViewStyle,
  
  clientInfoText: {
    fontSize: 14,
    color: colors.green[600],
    textAlign: 'center',
  } as TextStyle,
  
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  } as ViewStyle,
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  messagesList: {
    paddingVertical: 8,
  } as ViewStyle,
});