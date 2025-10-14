import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export const TrainersScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Trainers"
      subtitle="Manage your organization's trainers"
      features={[
        'Trainer roster',
        'Performance metrics',
        'Certification tracking',
        'Assignment management',
        'Communication tools',
      ]}
    />
  );
};

export const ClientsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="All Clients"
      subtitle="Overview of organization clients"
      features={[
        'Client directory',
        'Progress overview',
        'Billing status',
        'Activity tracking',
        'Support requests',
      ]}
    />
  );
};

export const AnalyticsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Analytics"
      subtitle="Organization performance insights"
      features={[
        'Revenue analytics',
        'Client retention',
        'Trainer performance',
        'Usage statistics',
        'Growth metrics',
      ]}
    />
  );
};

export const SettingsScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      title="Settings"
      subtitle="Organization configuration"
      features={[
        'Organization profile',
        'Billing settings',
        'Feature toggles',
        'User permissions',
        'Integration settings',
      ]}
    />
  );
};