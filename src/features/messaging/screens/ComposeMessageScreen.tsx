import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SectionHeader } from '../../../components/ui';
import { sendMessage } from '../data/mockData';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../constants';

// Import the navigation types
type ClientMessagingParamList = {
  ClientMessages: undefined;
  ClientConversation: {
    participantId: string;
    participantName: string;
    participantAvatar?: string;
  };
  SelectTrainer: undefined;
  ComposeMessage: {
    trainerId: string;
    trainerName: string;
    trainerSpecialty?: string;
  };
};

type ComposeMessageScreenProps = {
  navigation: StackNavigationProp<ClientMessagingParamList, 'ComposeMessage'>;
  route: RouteProp<ClientMessagingParamList, 'ComposeMessage'>;
};

export const ComposeMessageScreen: React.FC<ComposeMessageScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const { trainerId, trainerName, trainerSpecialty } = route.params;
  
  // Debug navigation object
  React.useEffect(() => {
    console.log('🧭 ComposeMessageScreen navigation object:', {
      canGoBack: navigation.canGoBack(),
      availableMethods: Object.keys(navigation),
      navigationState: navigation.getState?.()?.routes?.map(r => r.name) || 'N/A'
    });
  }, [navigation]);
  
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    console.log('📤 handleSendMessage called');
    console.log('📝 Message text:', messageText);
    console.log('👤 Current user:', user);
    console.log('🎯 Target trainer:', { trainerId, trainerName });
    
    if (!messageText.trim()) {
      Alert.alert('Message Required', 'Please enter a message before sending.');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID available');
      Alert.alert('Error', 'Please log in to send messages.');
      return;
    }

    try {
      setSending(true);

      console.log('📤 Calling sendMessage with:', {
        sender_id: user.id,
        receiver_id: trainerId,
        content: messageText.trim(),
      });

      // Send the message
      const sentMessage = sendMessage({
        sender_id: user.id,
        receiver_id: trainerId,
        content: messageText.trim(),
      });

      console.log('✅ Message sent successfully:', sentMessage);
      console.log('🚀 Navigating back to messages list...');

      // Navigate back to messages list - use navigate to ensure proper screen focus
      navigation.navigate('ClientMessages');
      
      // Small delay to ensure navigation completes, then show success
      setTimeout(() => {
        console.log('📱 Showing success alert');
        alert(`Message sent to ${trainerName} successfully!`);
      }, 500);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert(
        'Error',
        'Unable to send your message. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ handleCancel called');
    console.log('📝 Current message text length:', messageText.trim().length);
    
    if (messageText.trim()) {
      console.log('⚠️ User has written text, showing confirmation dialog');
      Alert.alert(
        'Discard Message',
        'Are you sure you want to discard this message?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              console.log('🗑️ User chose to discard, navigating back');
              console.log('🧭 Can go back:', navigation.canGoBack());
              
              try {
                if (navigation.canGoBack()) {
                  console.log('🔙 Using navigation.goBack()');
                  navigation.goBack();
                } else {
                  console.log('🔙 Cannot go back, using navigate to ClientMessages');
                  navigation.navigate('ClientMessages');
                }
              } catch (error) {
                console.error('❌ Navigation error:', error);
                console.log('🔙 Fallback: trying to navigate to ClientMessages');
                navigation.navigate('ClientMessages');
              }
            }
          }
        ]
      );
    } else {
      console.log('⬅️ No text entered, navigating back directly');
      console.log('🧭 Can go back:', navigation.canGoBack());
      
      try {
        if (navigation.canGoBack()) {
          console.log('🔙 Using navigation.goBack()');
          navigation.goBack();
        } else {
          console.log('🔙 Cannot go back, using navigate to ClientMessages');
          navigation.navigate('ClientMessages');
        }
      } catch (error) {
        console.error('❌ Navigation error:', error);
        console.log('🔙 Fallback: trying to navigate to ClientMessages');
        navigation.navigate('ClientMessages');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SectionHeader 
          title={`Message ${trainerName}`}
          subtitle={trainerSpecialty}
          showBackButton={true}
          onBackPress={handleCancel}
        />

        <View style={styles.messageContainer}>
          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.messageInput}
            multiline
            numberOfLines={6}
            placeholder={`Hi ${trainerName}, I wanted to ask about...`}
            placeholderTextColor={COLORS.text.secondary}
            value={messageText}
            onChangeText={setMessageText}
            textAlignVertical="top"
            maxLength={500}
            autoFocus
          />
          <Text style={styles.characterCount}>
            {messageText.length}/500 characters
          </Text>
        </View>

        <View style={styles.quickMessages}>
          <Text style={styles.quickMessagesLabel}>Quick Messages:</Text>
          {QUICK_MESSAGES.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickMessageButton}
              onPress={() => setMessageText(message)}
            >
              <Text style={styles.quickMessageText}>{message}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={sending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            <Text style={[
              styles.sendButtonText,
              (!messageText.trim() || sending) && styles.sendButtonTextDisabled
            ]}>
              {sending ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const QUICK_MESSAGES = [
  "Hi! I have a question about my workout routine.",
  "Could you help me with my nutrition plan?",
  "I'd like to schedule a session with you.",
  "I have some concerns about my current exercises.",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  quickMessages: {
    marginBottom: 24,
  },
  quickMessagesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  quickMessageButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quickMessageText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});