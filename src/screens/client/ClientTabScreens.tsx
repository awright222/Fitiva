import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export const ProgramsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="My Programs"
      subtitle="View and track your fitness programs"
      features={[
        'Current active programs',
        'Program progress tracking',
        'Exercise library',
        'Workout history',
        'Goal setting',
      ]}
    />
  );
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