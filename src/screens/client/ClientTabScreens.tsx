import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { ClientProgramViewScreen } from '../../features/content-library/screens';

export const ProgramsScreen: React.FC = () => {
  // Use the actual client program view screen instead of placeholder
  return <ClientProgramViewScreen navigation={{} as any} />;
};

export const ProgressScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Progress"
      subtitle="Track your fitness journey"
      features={[
        'Weight tracking',
        'Body measurements',
        'Progress photos',
        'Performance metrics',
        'Achievement badges',
      ]}
    />
  );
};

export const ScheduleScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Sessions"
      subtitle="Manage your workout sessions"
      features={[
        'Session calendar',
        'Trainer sessions',
        'Booking management',
        'Session history',
        'Rescheduling options',
      ]}
    />
  );
};

export const MessagesScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Messages"
      subtitle="Communicate with your trainer"
      features={[
        'Direct messaging',
        'Progress updates',
        'Exercise feedback',
        'Quick questions',
        'File sharing',
      ]}
    />
  );
};

export const ProfileScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Profile"
      subtitle="Manage your account settings"
      features={[
        'Personal information',
        'Health metrics',
        'Preferences',
        'Notification settings',
        'Privacy controls',
      ]}
    />
  );
};