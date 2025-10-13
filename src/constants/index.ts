/**
 * Application constants for Fitiva
 */

import { UserRole } from '../types';

// App Configuration
export const APP_CONFIG = {
  name: 'Fitiva',
  version: '1.0.0',
  supportEmail: 'support@fitiva.com',
  website: 'https://fitiva.com',
} as const;

// User Roles
export const USER_ROLES: Record<UserRole, string> = {
  client: 'Client',
  trainer: 'Trainer',
  org_manager: 'Organization Manager',
  admin: 'Administrator',
} as const;

// Colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: {
    primary: '#1C1C1E',
    secondary: '#3A3A3C',
    tertiary: '#48484A',
  },
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Screen Dimensions (typical breakpoints)
export const SCREEN_BREAKPOINTS = {
  small: 360,
  medium: 768,
  large: 1024,
} as const;

// Input Validation
export const VALIDATION = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  age: {
    min: 13,
    max: 120,
  },
  height: {
    minCm: 100,
    maxCm: 250,
  },
  weight: {
    minKg: 30,
    maxKg: 300,
  },
} as const;

// Exercise Related Constants
export const EXERCISE_DIFFICULTY = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

export const RPE_SCALE = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Moderate',
  4: 'Somewhat Hard',
  5: 'Hard',
  6: 'Very Hard',
  7: 'Very, Very Hard',
  8: 'Near Maximal',
  9: 'Maximal',
  10: 'Beyond Maximal',
} as const;

// Session Status
export const SESSION_STATUS = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  canceled: 'Canceled',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  active: 'Active',
  canceled: 'Canceled',
  paused: 'Paused',
} as const;

// Default Values
export const DEFAULTS = {
  profileImage: 'https://via.placeholder.com/150x150?text=Profile',
  language: 'en',
  timezone: 'America/New_York',
  currency: 'USD',
} as const;

// API Endpoints (relative to Supabase URL)
export const API_ENDPOINTS = {
  users: '/rest/v1/users',
  sessions: '/rest/v1/sessions',
  programs: '/rest/v1/programs',
  messages: '/rest/v1/messages',
  organizations: '/rest/v1/organizations',
} as const;

// Storage Buckets
export const STORAGE_BUCKETS = {
  profiles: 'profiles',
  exercises: 'exercises',
  documents: 'documents',
} as const;

// Date Formats
export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
} as const;