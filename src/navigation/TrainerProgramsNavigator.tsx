import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TrainerContentLibraryScreen, ProgramBuilderScreen } from '../features/content-library/screens';
import { TrainerProgramsStackParamList } from './types';

const Stack = createStackNavigator<TrainerProgramsStackParamList>();

export const TrainerProgramsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb', // Primary color
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="ContentLibrary" 
        component={TrainerContentLibraryScreen}
        options={{ 
          title: 'Exercise Library & Programs',
          headerShown: false, // Let the screen handle its own header
        }}
      />
      <Stack.Screen 
        name="ProgramBuilder" 
        component={ProgramBuilderScreen}
        options={{ 
          title: 'Program Builder',
          headerShown: false, // Let the screen handle its own header
        }}
      />
    </Stack.Navigator>
  );
};