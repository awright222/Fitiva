/**
 * List of conversations component
 * 
 * Features:
 * - Large touch targets for seniors
 * - Unread message indicators
 * - Avatar and participant info
 * - Clean, accessible design
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { Conversation } from '../types';

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  bodySmall: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
} as const;

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onPress,
}) => {
  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (text: string, maxLength: number = 50): string => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => onPress(conversation)}
      accessibilityLabel={`Conversation with ${conversation.participant_name}`}
      accessibilityHint="Tap to open this conversation"
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{conversation.participant_avatar}</Text>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {conversation.participant_name}
          </Text>
          <Text style={styles.lastMessageTime}>
            {formatLastMessageTime(conversation.last_message.created_at)}
          </Text>
        </View>
        
        <View style={styles.conversationFooter}>
          <Text 
            style={[
              styles.lastMessagePreview,
              conversation.unread_count > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {truncateMessage(conversation.last_message.content)}
          </Text>
          
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
  emptyMessage?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationPress,
  emptyMessage = "No conversations yet",
}) => {
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConversationListItem
          conversation={item}
          onPress={onConversationPress}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.conversationListContent}
    />
  );
};

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    minHeight: 80, // Large touch target for seniors
  } as ViewStyle,
  
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,
  
  avatar: {
    fontSize: 24,
  } as TextStyle,
  
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,
  
  participantName: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  } as TextStyle,
  
  lastMessageTime: {
    ...typography.caption,
    color: colors.gray[600],
  } as TextStyle,
  
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  
  lastMessagePreview: {
    ...typography.bodySmall,
    color: colors.gray[600],
    flex: 1,
    marginRight: 8,
  } as TextStyle,
  
  unreadMessage: {
    fontWeight: '600',
    color: colors.gray[900],
  } as TextStyle,
  
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  } as ViewStyle,
  
  unreadBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  
  conversationListContent: {
    paddingBottom: 16,
  } as ViewStyle,
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,
  
  emptyStateText: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
  } as TextStyle,
});