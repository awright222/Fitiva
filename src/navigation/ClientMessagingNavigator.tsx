/**
 * Client Messaging Navigator
 * 
 * Handles navigation between:
 * - ClientMessagesScreen (inbox)
 * - ClientConversationScreen (individual chat)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {
  ClientMessagesScreen,
  ClientConversationScreen,
} from '../features/messaging/screens';

// Navigation parameter types
export type ClientMessagingParamList = {
  ClientMessages: undefined;
  ClientConversation: {
    participantId: string;
    participantName: string;
    participantAvatar: string;
  };
};

const Stack = createStackNavigator<ClientMessagingParamList>();

export const ClientMessagingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We handle headers in individual screens
      }}
    >
      <Stack.Screen 
        name="ClientMessages" 
        component={ClientMessagesScreen}
      />
      <Stack.Screen 
        name="ClientConversation" 
        component={ClientConversationScreen}
      />
    </Stack.Navigator>
  );
};