/**
 * Navigation type definitions for Fitiva app
 */

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  RoleSelection: {
    signUpData?: {
      email: string;
      password: string;
      name: string;
      date_of_birth?: string;
    };
  } | undefined;
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
  Messages: undefined;
  Profile: undefined;
};

export type TrainerProgramsStackParamList = {
  ContentLibrary: undefined;
  ProgramBuilder: {
    mode: 'create' | 'edit';
    program?: any; // Program type from content library
  };
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
  ProfileLoading: undefined;
  ClientTabs: undefined;
  TrainerTabs: undefined;
  OrgTabs: undefined;
  AdminTabs: undefined;
};