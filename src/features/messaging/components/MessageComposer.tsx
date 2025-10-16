/**
 * Message composer component for typing and sending messages
 * 
 * Features:
 * - Large input field with good contrast
 * - Clear send button with visual feedback
 * - Accessible design for seniors
 * - Disabled state handling
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  gray: {
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  bodySmall: {
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

interface MessageComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[600]}
          multiline
          maxLength={500}
          editable={!disabled}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message here"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={onSend}
        disabled={!canSend}
        accessibilityLabel="Send message"
        accessibilityHint="Send the message you typed"
      >
        <Text style={[styles.sendButtonText, canSend && styles.sendButtonTextActive]}>
          Send
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    alignItems: 'flex-end',
  } as ViewStyle,
  
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    minHeight: 48, // Large touch target
    maxHeight: 120, // Prevent excessive height
  } as ViewStyle,
  
  input: {
    ...typography.body,
    color: colors.gray[900],
    flex: 1,
    // Use verticalAlign for web compatibility
    ...(Platform.OS === 'web' 
      ? { verticalAlign: 'middle' }
      : { textAlignVertical: 'center' }
    ),
  } as TextStyle,
  
  sendButton: {
    backgroundColor: colors.gray[300],
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  sendButtonActive: {
    backgroundColor: colors.primary,
  } as ViewStyle,
  
  sendButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.gray[600],
  } as TextStyle,
  
  sendButtonTextActive: {
    color: colors.white,
  } as TextStyle,
});