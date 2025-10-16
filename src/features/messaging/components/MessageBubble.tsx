/**
 * Individual message bubble component
 * 
 * Features:
 * - Large, readable text for seniors
 * - Clear visual distinction between sent/received
 * - Read receipts for sent messages
 * - Accessible timestamps
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import type { Message } from '../types';

// Colors optimized for seniors (high contrast, readable)
const colors = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  gray: {
    100: '#f3f4f6',
    600: '#4b5563',
    900: '#111827',
  },
  green: {
    500: '#22c55e',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  body: {
    fontSize: 18, // Larger than typical for seniors
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
} as const;

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showTimestamp = true,
}) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={[styles.container, isOwnMessage && styles.ownContainer]}>
      <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwnMessage && styles.ownText]}>
          {message.content}
        </Text>
        {showTimestamp && (
          <Text style={[styles.time, isOwnMessage && styles.ownTime]}>
            {formatTime(message.created_at)}
            {isOwnMessage && message.read_at && (
              <Text style={styles.readIndicator}> ✓✓</Text>
            )}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  } as ViewStyle,
  
  ownContainer: {
    alignItems: 'flex-end',
  } as ViewStyle,
  
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 44, // Minimum touch target
  } as ViewStyle,
  
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 8,
  } as ViewStyle,
  
  otherBubble: {
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 8,
  } as ViewStyle,
  
  text: {
    ...typography.body,
    color: colors.gray[900],
  } as TextStyle,
  
  ownText: {
    color: colors.white,
  } as TextStyle,
  
  time: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: 4,
  } as TextStyle,
  
  ownTime: {
    color: colors.primaryLight,
  } as TextStyle,
  
  readIndicator: {
    color: colors.green[500],
  } as TextStyle,
});