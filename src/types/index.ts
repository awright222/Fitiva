// User roles in the system
export type UserRole = 'client' | 'trainer' | 'org_manager' | 'admin';

// User organization roles
export type UserOrgRole = 'client' | 'trainer' | 'org_manager';

// User interface
export interface User {
  id: string;  // UUID from Supabase auth
  name: string;
  email: string;
  role: UserRole;
  date_of_birth?: string;  // ISO date string
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  location?: string;
  preferred_language?: string;
  created_at: string;  // ISO date string
  updated_at: string;  // ISO date string
}

// Organization interface
export interface Organization {
  id: number;
  name: string;
  branding?: any;
  created_at: string;
  updated_at: string;
}

// Session statuses
export type SessionStatus = 'scheduled' | 'completed' | 'canceled';

// Session interface
export interface Session {
  id: number;
  trainer_id: string;  // UUID reference to users table
  client_id: string;   // UUID reference to users table
  org_id?: number;
  scheduled_at: string;  // ISO date string
  status: SessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Program interface
export interface Program {
  id: number;
  trainer_id: string;  // UUID reference to users table
  client_id: string;   // UUID reference to users table
  org_id?: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Authentication related types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: UserRole;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  date_of_birth?: string;  // ISO date string
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  location?: string;
  preferred_language?: string;
}

export interface SignInData {
  email: string;
  password: string;
}