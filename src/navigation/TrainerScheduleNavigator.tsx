import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TrainerScheduleScreen } from '../features/scheduling/screens';
import { COLORS } from '../constants';

export type TrainerScheduleStackParamList = {
  TrainerSchedule: undefined;
  ManageAvailability: undefined;
};

const Stack = createStackNavigator<TrainerScheduleStackParamList>();

export const TrainerScheduleNavigator: React.FC = () => {
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
        name="TrainerSchedule"
        component={TrainerScheduleScreen}
        options={{ title: 'My Schedule' }}
      />
      {/* ManageAvailability screen will be added in a future update */}
    </Stack.Navigator>
  );
};