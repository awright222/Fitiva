import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { OrganizationsScreen, UsersScreen, AnalyticsScreen, SettingsScreen } from '../screens/admin/AdminTabScreens';
import { AdminTabParamList } from './types';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'AdminHome':
              iconName = focused ? 'shield' : 'shield-outline';
              break;
            case 'Organizations':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            default:
              iconName = 'shield-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.error,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
        },
        headerStyle: {
          backgroundColor: COLORS.error,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="AdminHome" 
        component={AdminHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Organizations" 
        component={OrganizationsScreen}
        options={{ title: 'Organizations' }}
      />
      <Tab.Screen 
        name="Users" 
        component={UsersScreen}
        options={{ title: 'Users' }}
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