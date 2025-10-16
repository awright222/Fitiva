import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { ClientTabNavigator } from './ClientTabNavigator';
import { TrainerTabNavigator } from './TrainerTabNavigator';
import { OrgTabNavigator } from './OrgTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';
import { RootStackParamList } from './types';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

export const RootNavigator: React.FC = () => {
  const { user, isLoading, userProfile } = useAuth();
  const [profileTimeout, setProfileTimeout] = React.useState(false);

  // Add timeout for profile loading
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (user && !userProfile && !isLoading) {
      timer = setTimeout(() => {
        setProfileTimeout(true);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, userProfile, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const userRole = userProfile?.role;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !userProfile && !profileTimeout ? (
        // If user is authenticated but has no profile, show loading briefly
        <Stack.Screen 
          name="ProfileLoading" 
          component={LoadingScreen} 
          options={{ headerShown: false }}
        />
      ) : (
        <>
          {userRole === 'client' && (
            <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
          )}
          {(userRole === 'trainer' || profileTimeout) && (
            <Stack.Screen name="TrainerTabs" component={TrainerTabNavigator} />
          )}
          {userRole === 'org_manager' && (
            <Stack.Screen name="OrgTabs" component={OrgTabNavigator} />
          )}
          {userRole === 'admin' && (
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});