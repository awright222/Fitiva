import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { OrgHomeScreen } from '../screens/org/OrgHomeScreen';
import { TrainersScreen, ClientsScreen, AnalyticsScreen, SettingsScreen } from '../screens/org/OrgTabScreens';
import { OrgTabParamList } from './types';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator<OrgTabParamList>();

export const OrgTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'OrgHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Trainers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Clients':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.success,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
        },
        headerStyle: {
          backgroundColor: COLORS.success,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="OrgHome" 
        component={OrgHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Trainers" 
        component={TrainersScreen}
        options={{ title: 'Trainers' }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsScreen}
        options={{ title: 'Clients' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};