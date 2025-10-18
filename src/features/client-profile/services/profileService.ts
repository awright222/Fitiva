/**
 * Client Profile Service
 * 
 * Handles client profile data operations including creation, updates, and retrieval.
 * This service provides a mock implementation for development and testing.
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Profile CRUD Operations:
 *    - getClientProfile() -> supabase.from('client_profiles').select().eq('user_id', userId).single()
 *    - saveClientProfile() -> supabase.from('client_profiles').upsert(profileData)
 *    - deleteClientProfile() -> supabase.from('client_profiles').delete().eq('user_id', userId)
 * 
 * 2. Profile Validation:
 *    - Validate age, height, weight ranges
 *    - Sanitize medical condition inputs
 *    - Verify equipment access options
 * 
 * 3. Profile Completion Tracking:
 *    - Calculate completion percentage
 *    - Track onboarding progress
 *    - Trigger recommendations when profile is complete
 * 
 * This will be replaced with real Supabase queries when ENHANCED_CLIENT_PROFILES feature is enabled
 */

import { ClientProfile } from '../../../types';

// Mock in-memory storage for development
// TODO: Replace with Supabase client_profiles table
const mockClientProfiles = new Map<string, ClientProfile>();

// Seed some test data
const seedTestProfiles = () => {
  // Example client profile for testing
  const testProfile: ClientProfile = {
    id: 1,
    user_id: 'test-client-123',
    age: 35,
    height_cm: 165,
    weight_kg: 68,
    gender: 'Female',
    location: 'San Francisco, CA',
    goals: ['weight_loss', 'strength', 'mobility'],
    preferred_training_style: 'virtual',
    frequency_per_week: 3,
    physical_limitations: 'Previous knee injury - avoid high-impact exercises',
    medical_conditions: ['hypertension'],
    medications: 'Blood pressure medication',
    equipment_access: ['Dumbbells', 'Resistance Bands', 'Yoga Mat'],
    activity_level: 'moderate',
    motivation_level: 7,
    discoverable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockClientProfiles.set(testProfile.user_id, testProfile);
  
  console.log('🌱 Seeded test client profiles:', mockClientProfiles.size);
};

// Initialize test data
seedTestProfiles();

/**
 * Get client profile by user ID
 * TODO: Replace with Supabase query
 */
export const getClientProfile = async (userId: string): Promise<ClientProfile | null> => {
  try {
    console.log('📖 Getting client profile for user:', userId);
    
    // TODO: Replace with Supabase
    // const { data, error } = await supabase
    //   .from('client_profiles')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .single();
    
    const profile = mockClientProfiles.get(userId);
    console.log('📖 Found profile:', !!profile);
    
    return profile || null;
  } catch (error) {
    console.error('❌ Error getting client profile:', error);
    throw error;
  }
};

/**
 * Save or update client profile
 * TODO: Replace with Supabase upsert
 */
export const saveClientProfile = async (profileData: Partial<ClientProfile>): Promise<ClientProfile> => {
  try {
    console.log('💾 Saving client profile for user:', profileData.user_id);
    console.log('💾 Profile data:', profileData);
    
    if (!profileData.user_id) {
      throw new Error('User ID is required to save profile');
    }
    
    // Get existing profile or create new one
    const existingProfile = mockClientProfiles.get(profileData.user_id);
    
    const updatedProfile: ClientProfile = {
      id: existingProfile?.id || Date.now(),
      user_id: profileData.user_id,
      age: profileData.age,
      height_cm: profileData.height_cm,
      weight_kg: profileData.weight_kg,
      gender: profileData.gender,
      location: profileData.location,
      goals: profileData.goals || [],
      preferred_training_style: profileData.preferred_training_style || 'any',
      frequency_per_week: profileData.frequency_per_week,
      physical_limitations: profileData.physical_limitations,
      medical_conditions: profileData.medical_conditions || [],
      medications: profileData.medications,
      equipment_access: profileData.equipment_access || [],
      activity_level: profileData.activity_level || 'moderate',
      motivation_level: profileData.motivation_level || 5,
      discoverable: profileData.discoverable ?? true,
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // TODO: Replace with Supabase upsert
    // const { data, error } = await supabase
    //   .from('client_profiles')
    //   .upsert(updatedProfile)
    //   .select()
    //   .single();
    
    mockClientProfiles.set(profileData.user_id, updatedProfile);
    
    console.log('✅ Profile saved successfully');
    console.log('📊 Total profiles in system:', mockClientProfiles.size);
    
    return updatedProfile;
  } catch (error) {
    console.error('❌ Error saving client profile:', error);
    throw error;
  }
};

/**
 * Delete client profile
 * TODO: Replace with Supabase delete
 */
export const deleteClientProfile = async (userId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting client profile for user:', userId);
    
    // TODO: Replace with Supabase
    // const { error } = await supabase
    //   .from('client_profiles')
    //   .delete()
    //   .eq('user_id', userId);
    
    mockClientProfiles.delete(userId);
    
    console.log('✅ Profile deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting client profile:', error);
    throw error;
  }
};

/**
 * Check if profile is complete for onboarding
 */
export const isProfileComplete = (profile: ClientProfile): boolean => {
  const requiredFields = [
    profile.age,
    profile.height_cm,
    profile.weight_kg,
    profile.gender,
    profile.goals?.length,
    profile.preferred_training_style,
    profile.frequency_per_week,
    profile.activity_level,
  ];
  
  return requiredFields.every(field => 
    field !== undefined && field !== null && field !== 0
  );
};

/**
 * Calculate profile completion percentage
 */
export const calculateCompletionPercentage = (profile: Partial<ClientProfile>): number => {
  const fields = [
    profile.age,
    profile.height_cm,
    profile.weight_kg,
    profile.gender,
    profile.location,
    profile.goals?.length,
    profile.preferred_training_style,
    profile.frequency_per_week,
    profile.activity_level,
    profile.equipment_access?.length,
  ];
  
  const completedFields = fields.filter(field => 
    field !== undefined && field !== null && field !== 0
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * Get profiles that match trainer criteria (for recommendations)
 * TODO: Add smart matching algorithm
 */
export const getDiscoverableProfiles = async (filters?: {
  goals?: string[];
  equipment_access?: string[];
  activity_level?: string;
  location?: string;
}): Promise<ClientProfile[]> => {
  try {
    console.log('🔍 Getting discoverable profiles with filters:', filters);
    
    // TODO: Replace with Supabase query with filters
    // const query = supabase
    //   .from('client_profiles')
    //   .select('*')
    //   .eq('discoverable', true);
    
    const allProfiles = Array.from(mockClientProfiles.values());
    const discoverableProfiles = allProfiles.filter(profile => profile.discoverable);
    
    // Apply filters if provided
    let filteredProfiles = discoverableProfiles;
    
    if (filters?.goals?.length) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.goals?.some(goal => filters.goals!.includes(goal))
      );
    }
    
    if (filters?.equipment_access?.length) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.equipment_access?.some(equipment => filters.equipment_access!.includes(equipment))
      );
    }
    
    if (filters?.activity_level) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.activity_level === filters.activity_level
      );
    }
    
    if (filters?.location) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    console.log('🔍 Found discoverable profiles:', filteredProfiles.length);
    
    return filteredProfiles;
  } catch (error) {
    console.error('❌ Error getting discoverable profiles:', error);
    throw error;
  }
};

/**
 * Get recommendations for equipment based on goals
 */
export const getEquipmentRecommendations = (goals: string[]): string[] => {
  const recommendations: { [key: string]: string[] } = {
    'weight_loss': ['Resistance Bands', 'Yoga Mat', 'Dumbbells'],
    'muscle_gain': ['Dumbbells', 'Gym Access', 'Pull-up Bar'],
    'strength': ['Dumbbells', 'Kettlebells', 'Gym Access'],
    'mobility': ['Yoga Mat', 'Foam Roller', 'Resistance Bands'],
    'cardio': ['No Equipment', 'Gym Access', 'Exercise Ball'],
    'balance': ['Yoga Mat', 'Exercise Ball', 'Foam Roller'],
    'recovery': ['Foam Roller', 'Yoga Mat'],
    'general_fitness': ['Dumbbells', 'Resistance Bands', 'Yoga Mat'],
  };
  
  const suggested = new Set<string>();
  
  goals.forEach(goal => {
    const goalRecommendations = recommendations[goal] || [];
    goalRecommendations.forEach(equipment => suggested.add(equipment));
  });
  
  return Array.from(suggested);
};

/**
 * Export all profiles for debugging/admin
 */
export const getAllClientProfiles = (): ClientProfile[] => {
  return Array.from(mockClientProfiles.values());
};