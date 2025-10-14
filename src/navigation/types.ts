/**
 * Navigation type definitions for Fitiva app
 */

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;
};

export type ClientTabParamList = {
  ClientHome: undefined;
  Programs: undefined;
  Sessions: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type TrainerTabParamList = {
  TrainerHome: undefined;
  Clients: undefined;
  Programs: undefined;
  Schedule: undefined;
  Profile: undefined;
};

export type OrgTabParamList = {
  OrgHome: undefined;
  Trainers: undefined;
  Clients: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  Organizations: undefined;
  Users: undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ClientTabs: undefined;
  TrainerTabs: undefined;
  OrgTabs: undefined;
  AdminTabs: undefined;
};