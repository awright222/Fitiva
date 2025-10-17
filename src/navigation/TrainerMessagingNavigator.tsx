/**
 * Trainer Messaging Navigator
 * 
 * Handles navigation between:
 * - TrainerMessagesScreen (client inbox)
 * - TrainerConversationScreen (individual client chat)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {
  TrainerMessagesScreen,
  TrainerConversationScreen,
} from '../features/messaging/screens';

// Navigation parameter types
export type TrainerMessagingParamList = {
  TrainerMessages: undefined;
  TrainerConversation: {
    participantId: string;
    participantName: string;
    participantAvatar: string;
    participantRole: 'client' | 'trainer';
  };
};

const Stack = createStackNavigator<TrainerMessagingParamList>();

export const TrainerMessagingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196f3',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TrainerMessages" 
        component={TrainerMessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="TrainerConversation" 
        component={TrainerConversationScreen}
        options={({ route }) => ({ 
          title: route.params?.participantName || 'Conversation',
          headerBackTitle: 'Messages'
        })}
      />
    </Stack.Navigator>
  );
};