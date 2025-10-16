import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { TrainerContentLibraryScreen } from '../../features/content-library/screens';

export const ClientsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="My Clients"
      subtitle="Manage your client roster"
      features={[
        'Client list and profiles',
        'Progress monitoring',
        'Communication tools',
        'Session scheduling',
        'Program assignments',
      ]}
    />
  );
};

export const HomeScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Trainer Dashboard"
      subtitle="Manage your clients and programs"
      features={[
        'Client overview',
        'Recent activity',
        'Quick actions',
        'Program assignments',
        'Schedule summary',
      ]}
    />
  );
};

export const ProgramsScreen: React.FC = () => {
  // Use the actual content library screen instead of placeholder
  return <TrainerContentLibraryScreen navigation={{} as any} />;
};

export const ScheduleScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Schedule"
      subtitle="Manage your training schedule"
      features={[
        'Calendar overview',
        'Session management',
        'Availability settings',
        'Client bookings',
        'Time slot configuration',
      ]}
    />
  );
};

export const ProfileScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Profile"
      subtitle="Manage your trainer profile"
      features={[
        'Professional information',
        'Certifications',
        'Specializations',
        'Availability preferences',
        'Account settings',
      ]}
    />
  );
};