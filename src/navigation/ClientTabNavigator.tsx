import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { ProgramsScreen, MessagesScreen, ProfileScreen } from '../screens/client/ClientTabScreens';
import { ClientScheduleNavigator } from './ClientScheduleNavigator';
import { ClientTabParamList } from './types';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator<ClientTabParamList>();

export const ClientTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'ClientHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Programs':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Sessions':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="ClientHome" 
        component={ClientHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Programs" 
        component={ProgramsScreen}
        options={{ title: 'Programs' }}
      />
      <Tab.Screen 
        name="Sessions" 
        component={ClientScheduleNavigator}
        options={{ title: 'Sessions', headerShown: false }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};