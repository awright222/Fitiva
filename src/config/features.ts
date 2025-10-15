/**
 * Feature flags for Fitiva app
 * Use these to enable/disable features during development and deployment
 */

export interface FeatureFlags {
  // Authentication & Core Features
  EMAIL_VERIFICATION_REQUIRED: boolean;
  PASSWORD_RESET_ENABLED: boolean;
  SOCIAL_LOGIN_ENABLED: boolean;
  
  // Payment & Subscription Features
  PAYMENTS_ENABLED: boolean;
  SUBSCRIPTION_MANAGEMENT: boolean;
  TRAINER_PAYOUTS: boolean;
  PROMOTION_CODES: boolean;
  
  // Communication Features
  MESSAGING_ENABLED: boolean;
  VIDEO_CALLS_ENABLED: boolean;
  NOTIFICATIONS_ENABLED: boolean;
  
    // Analytics Features
  ANALYTICS_ENABLED: boolean;
  ADVANCED_REPORTING: boolean;
  ENGAGEMENT_TRACKING: boolean;
  EXPORT_DATA: boolean;
  
  // Organization & White Label Features
  WHITE_LABEL_ENABLED: boolean;
  ORGANIZATION_MANAGEMENT: boolean;
  MULTI_TENANT_SUPPORT: boolean;
  CUSTOM_BRANDING: boolean;
  
  // Advanced Features
  ANALYTICS_ENABLED: boolean;
  ENGAGEMENT_TRACKING: boolean;
  ADVANCED_REPORTING: boolean;
  EXPORT_DATA: boolean;
  
  // Content & Program Features
  VIDEO_CONTENT: boolean;
  PROGRAM_TEMPLATES: boolean;
  EXERCISE_LIBRARY: boolean;
  CUSTOM_EXERCISES: boolean;
  
  // Communication Features
  IN_APP_MESSAGING: boolean;
  VIDEO_CALLS: boolean;
  PUSH_NOTIFICATIONS: boolean;
  EMAIL_NOTIFICATIONS: boolean;
  
  // Compliance & Security
  AUDIT_LOGGING: boolean;
  GDPR_COMPLIANCE: boolean;
  HIPAA_COMPLIANCE: boolean;
  TWO_FACTOR_AUTH: boolean;
  
  // Mobile Features
  OFFLINE_MODE: boolean;
  BIOMETRIC_AUTH: boolean;
  CALENDAR_INTEGRATION: boolean;
  HEALTH_KIT_INTEGRATION: boolean;
}

export const FEATURES: FeatureFlags = {
  // Authentication & Core Features (MVP)
  EMAIL_VERIFICATION_REQUIRED: false, // Simplified for MVP
  PASSWORD_RESET_ENABLED: true,
  SOCIAL_LOGIN_ENABLED: false, // Future enhancement
  
  // Payment & Subscription Features (Post-MVP)
  PAYMENTS_ENABLED: false,
  SUBSCRIPTION_MANAGEMENT: false,
  TRAINER_PAYOUTS: false,
  PROMOTION_CODES: false,
  
  // Communication Features (Phase 2)
  MESSAGING_ENABLED: true, // Enable for dashboard display
  VIDEO_CALLS_ENABLED: false,
  NOTIFICATIONS_ENABLED: false,
  
  // Analytics Features (Future)
  ANALYTICS_ENABLED: false,
  ADVANCED_REPORTING: false,
  ENGAGEMENT_TRACKING: false,
  EXPORT_DATA: false,
  
  // Organization & White Label Features (Post-MVP)
  WHITE_LABEL_ENABLED: false,
  ORGANIZATION_MANAGEMENT: false,
  MULTI_TENANT_SUPPORT: false,
  CUSTOM_BRANDING: false,
  
  // Content & Program Features (Phase 2)
  VIDEO_CONTENT: false,
  PROGRAM_TEMPLATES: false,
  EXERCISE_LIBRARY: true, // Basic exercise library for MVP
  CUSTOM_EXERCISES: false,
  
  // Communication Features (Phase 2)
  IN_APP_MESSAGING: false,
  VIDEO_CALLS: false,
  PUSH_NOTIFICATIONS: false,
  EMAIL_NOTIFICATIONS: false,
  
  // Compliance & Security (Future)
  AUDIT_LOGGING: false,
  GDPR_COMPLIANCE: false,
  HIPAA_COMPLIANCE: false,
  TWO_FACTOR_AUTH: false,
  
  // Mobile Features (Future)
  OFFLINE_MODE: false,
  BIOMETRIC_AUTH: false,
  CALENDAR_INTEGRATION: false,
  HEALTH_KIT_INTEGRATION: false,
};

/**
 * Helper function to check if a feature is enabled
 * @param feature Feature flag key
 * @returns boolean indicating if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURES[feature];
};

/**
 * Helper function to get placeholder message for disabled features
 * @param feature Feature name for display
 * @returns User-friendly message
 */
export const getFeaturePlaceholder = (feature: string): string => {
  return `${feature} is not active in the MVP. This feature will be available in a future release.`;
};

/**
 * Development-only function to enable features for testing
 * Only works in development mode
 */
export const enableFeatureForDev = (feature: keyof FeatureFlags): void => {
  if (__DEV__) {
    (FEATURES as any)[feature] = true;
    console.log(`[DEV] Enabled feature: ${feature}`);
  }
};

/**
 * Get features enabled for current user role
 * Some features may be role-restricted
 */
export const getFeaturesForRole = (userRole: string): Partial<FeatureFlags> => {
  const baseFeatures = { ...FEATURES };
  
  switch (userRole) {
    case 'admin':
      // Admins get access to all enabled features
      return baseFeatures;
      
    case 'org_manager':
      // Org managers get management features (when enabled)
      return {
        ...baseFeatures,
        // Additional org-specific features would go here
      };
      
    case 'trainer':
      // Trainers get program and client management features
      return {
        ...baseFeatures,
        // Trainer-specific features
      };
      
    case 'client':
      // Clients get basic app functionality
      return {
        ...baseFeatures,
        // Remove admin/management features
        ORGANIZATION_MANAGEMENT: false,
        ADVANCED_REPORTING: false,
        AUDIT_LOGGING: false,
      };
      
    default:
      return baseFeatures;
  }
};

// Environment-based feature overrides
if (process.env.NODE_ENV === 'development') {
  // Enable additional features for development
  FEATURES.EMAIL_VERIFICATION_REQUIRED = false;
  FEATURES.ANALYTICS_ENABLED = true; // For testing
}

export default FEATURES;