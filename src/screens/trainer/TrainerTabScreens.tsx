import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

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

export const ProgramsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Programs"
      subtitle="Create and manage fitness programs"
      features={[
        'Program templates',
        'Exercise library',
        'Custom workout builder',
        'Program sharing',
        'Progress tracking tools',
      ]}
    />
  );
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