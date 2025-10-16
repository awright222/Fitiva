import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ClientScheduleScreen, BookSessionScreen } from '../features/scheduling/screens';
import { COLORS } from '../constants';

export type ClientScheduleStackParamList = {
  ClientSchedule: undefined;
  BookSession: undefined;
};

const Stack = createStackNavigator<ClientScheduleStackParamList>();

export const ClientScheduleNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ClientSchedule"
        component={ClientScheduleScreen}
        options={{ title: 'My Sessions' }}
      />
      <Stack.Screen
        name="BookSession"
        component={BookSessionScreen}
        options={{ title: 'Book Session' }}
      />
    </Stack.Navigator>
  );
};