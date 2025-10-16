export const FEATURES = { 
  // Core scheduling features (MVP)
  SCHEDULING_ENABLED: true,
  SESSION_BOOKING: true,
  
  // Content Library & Programs (MVP Phase 2)
  CONTENT_LIBRARY_ENABLED: true, // Exercise library and program builder
  PROGRAM_BUILDER_ENABLED: true, // Trainer program creation
  EXERCISE_UPLOADS_ENABLED: true, // Image/video uploads for exercises
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
  ORGANIZATION_MANAGEMENT: false,
}; 

export default FEATURES;
