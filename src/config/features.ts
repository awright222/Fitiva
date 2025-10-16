export const FEATURES = { 
  // Core scheduling features (MVP)
  SCHEDULING_ENABLED: true,
  SESSION_BOOKING: true,
  
  // Content Library & Programs (MVP Phase 2)
  CONTENT_LIBRARY_ENABLED: true, // Exercise library and program builder
  PROGRAM_BUILDER_ENABLED: true, // Trainer program creation
  EXERCISE_UPLOADS_ENABLED: true, // Image/video uploads for exercises
  GLOBAL_EXERCISES_ENABLED: true, // View admin-created global exercises
  EXERCISE_THUMBNAILS_ENABLED: true, // Upload and display exercise thumbnails
  EXERCISE_VIDEOS_ENABLED: true, // Upload and display exercise demo videos
  VIDEO_COMPRESSION_ENABLED: true, // Compress videos before upload (mobile optimization)
  AI_SUGGESTIONS_ENABLED: false, // Smart exercise suggestions (future)
  
  // Payment & subscription features (Post-MVP) 
  PAYMENTS_ENABLED: false,
  SUBSCRIPTION_MANAGEMENT: false,
  
  // Communication features (Phase 2)
  MESSAGING_ENABLED: true, 
  VIDEO_CALLS_ENABLED: false,
  NOTIFICATIONS_ENABLED: false,
  REMINDERS_ENABLED: false, // Push notifications for session reminders
  
  // Real-time features (Future)
  REALTIME_ENABLED: false, // Live session updates via Supabase realtime
  LIVE_CALENDAR_SYNC: false, // Real-time calendar synchronization
  
  // Analytics & reporting (Future)
  ANALYTICS_ENABLED: false,
  ADVANCED_REPORTING: false,
  
  // Organization & white-label (Future)
  WHITE_LABEL_ENABLED: false, // Organization-level content sharing
  ORG_CONTENT_LIBRARY: false, // Organization-level exercise library
  ORGANIZATION_MANAGEMENT: false,
  
  // Client Experience
  CLIENT_PROGRAM_VIEW_ENABLED: true, // "My Program" screen for clients
  EXERCISE_COMPLETION_TRACKING: true, // Track exercise/day completion
  CLIENT_PROGRESS_ANALYTICS: false, // Advanced progress tracking (future)
}; 

// Utility functions for feature checking
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

export const canUploadContent = (): boolean => {
  return FEATURES.CONTENT_LIBRARY_ENABLED && FEATURES.EXERCISE_UPLOADS_ENABLED;
};

export const canAccessGlobalExercises = (): boolean => {
  return FEATURES.CONTENT_LIBRARY_ENABLED && FEATURES.GLOBAL_EXERCISES_ENABLED;
};

export const canAccessOrgContent = (): boolean => {
  return FEATURES.WHITE_LABEL_ENABLED && FEATURES.ORG_CONTENT_LIBRARY;
};

export const supportsVideoFeatures = (): boolean => {
  return FEATURES.EXERCISE_VIDEOS_ENABLED && FEATURES.VIDEO_COMPRESSION_ENABLED;
};

export default FEATURES;
