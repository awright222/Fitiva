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
  SelectTrainerScreen,
  ComposeMessageScreen,
} from '../features/messaging/screens';

// Navigation parameter types
export type ClientMessagingParamList = {
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
      <Stack.Screen 
        name="SelectTrainer" 
        component={SelectTrainerScreen}
      />
      <Stack.Screen 
        name="ComposeMessage" 
        component={ComposeMessageScreen}
      />
    </Stack.Navigator>
  );
};