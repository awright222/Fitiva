/**
 * Client Conversation Screen - Individual chat view
 * 
 * Features:
 * - Real-time chat interface with trainer
 * - Message history with timestamps
 * - Message composer for sending new messages
 * - Read receipts and delivery status
 * - Large, accessible UI for seniors
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Message Loading:
 *    - Replace mock data with: supabase.from('messages').select().match({ conversation_participants })
 *    - Add pagination for message history
 * 
 * 2. Real-time Messages:
 *    - Subscribe to new messages: supabase.channel('messages').on('INSERT', callback)
 *    - Auto-scroll to new messages
 *    - Show typing indicators
 * 
 * 3. Send Messages:
 *    - Replace sendMessage with: supabase.from('messages').insert()
 *    - Handle optimistic updates and error states
 * 
 * 4. Read Receipts:
 *    - Mark messages as read: supabase.from('messages').update({ read_at })
 *    - Real-time read receipt updates
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
type ClientConversationScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export const ClientConversationScreen: React.FC<ClientConversationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const { participantId, participantName, participantAvatar } = route.params || {};
  
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
      
      // Mock user ID for demonstration (replace with real auth)
      const userId = user?.id || '1'; // Default to client user for demo
      
      // TODO: When implementing Supabase:
      // const { data, error } = await supabase
      //   .from('messages')
      //   .select('*')
      //   .or(`and(sender_id.eq.${userId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${userId})`)
      //   .order('created_at', { ascending: true });
      
      const conversationMessages = getMessages(userId, participantId);
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

  // TODO: Replace with: supabase.from('messages').update({ read_at: new Date() }).eq('sender_id', participantId).eq('receiver_id', userId).is('read_at', null)
  const markMessagesAsRead = () => {
    const userId = user?.id || '1';
    markConversationAsRead(userId, participantId);
  };

  // TODO: Replace with Supabase real-time subscription
  // useEffect(() => {
  //   if (!user?.id) return;
  //   
  //   const subscription = supabase
  //     .channel('conversation_messages')
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
  //       // Mark as read if received from participant
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
      
      const userId = user?.id || '1';
      const messageContent = messageText.trim();
      
      // Clear input immediately for better UX
      setMessageText('');
      
      // TODO: Replace with Supabase insert
      // const { data, error } = await supabase
      //   .from('messages')
      //   .insert({
      //     sender_id: userId,
      //     receiver_id: participantId,
      //     content: messageContent,
      //   })
      //   .select()
      //   .single();
      
      const newMessage = sendMessage({
        sender_id: userId,
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

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const userId = user?.id || '1';
    const isOwnMessage = item.sender_id === userId;
    
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
            subtitle="Trainer"
            showBackButton={true}
            onBackPress={() => {
              console.log('Conversation screen back pressed');
              navigation.goBack();
            }}
          />
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