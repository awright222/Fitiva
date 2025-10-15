import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '../services/auth';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, SignUpData } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Secure storage keys
const STORAGE_KEYS = {
  SESSION: 'fitiva_session',
  USER_PROFILE: 'fitiva_user_profile',
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cross-platform storage helpers
  const storeSession = async (session: Session | null) => {
    try {
      if (session) {
        const sessionData = JSON.stringify(session);
        if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
          await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, sessionData);
        } else {
          // Fallback to localStorage for web
          localStorage.setItem(STORAGE_KEYS.SESSION, sessionData);
        }
      } else {
        if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
        } else {
          // Fallback to localStorage for web
          localStorage.removeItem(STORAGE_KEYS.SESSION);
        }
      }
    } catch (error) {
      console.error('Error storing session:', error);
    }
  };

  const storeUserProfile = async (profile: User | null) => {
    try {
      if (profile) {
        const profileData = JSON.stringify(profile);
        if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
          await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, profileData);
        } else {
          // Fallback to localStorage for web
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, profileData);
        }
      } else {
        if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
        } else {
          // Fallback to localStorage for web
          localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        }
      }
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  };

  const loadStoredSession = async (): Promise<Session | null> => {
    try {
      let storedSession: string | null = null;
      if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
        storedSession = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION);
      } else {
        // Fallback to localStorage for web
        storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      }
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error('Error loading stored session:', error);
      return null;
    }
  };

  const loadStoredUserProfile = async (): Promise<User | null> => {
    try {
      let storedProfile: string | null = null;
      if (SecureStore.isAvailableAsync && await SecureStore.isAvailableAsync()) {
        storedProfile = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PROFILE);
      } else {
        // Fallback to localStorage for web
        storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      }
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error('Error loading stored user profile:', error);
      return null;
    }
  };

  const refreshProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      try {
        console.log('RefreshProfile: Fetching profile for user:', targetUserId);
        const profile = await AuthService.getUserProfile(targetUserId);
        console.log('RefreshProfile: Profile fetched:', profile);
        setUserProfile(profile);
        await storeUserProfile(profile);
      } catch (error: any) {
        console.error('Error refreshing profile:', error);
        // If user is authenticated but profile doesn't exist, sign them out
        if (error?.message?.includes('0 rows') || error?.code === 'PGRST116') {
          console.log('User authenticated but no profile found - signing out to allow fresh signup');
          await signOut();
          return;
        } else {
          // Clear stored profile if fetch fails for other reasons
          setUserProfile(null);
        }
        await storeUserProfile(null);
      }
    } else {
      console.log('RefreshProfile: No user ID provided and no user in state');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedProfile = await AuthService.updateUserProfile(updates);
      setUserProfile(updatedProfile);
      await storeUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, session: authSession } = await AuthService.signIn({ email, password });
      
      if (authSession) {
        setSession(authSession);
        setUser(authUser);
        await storeSession(authSession);
        
        if (authUser) {
          await refreshProfile(authUser.id);
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      const { user: authUser, session: authSession } = await AuthService.signUp(data);
      
      if (authSession) {
        setSession(authSession);
        setUser(authUser);
        await storeSession(authSession);
        
        if (authUser) {
          await refreshProfile(authUser.id);
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      
      // Clear state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      // Clear secure storage
      await storeSession(null);
      await storeUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to load from secure storage
        const storedSession = await loadStoredSession();
        const storedProfile = await loadStoredUserProfile();

        if (storedSession && storedProfile) {
          setSession(storedSession);
          setUser(storedSession.user);
          setUserProfile(storedProfile);
        }

        // Then check with Supabase for current session
        const currentSession = await AuthService.getSession();
        
        if (currentSession?.user && mounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          await storeSession(currentSession);
          await refreshProfile(currentSession.user.id);
        } else if (mounted) {
          // Clear everything if no valid session
          setUser(null);
          setUserProfile(null);
          setSession(null);
          await storeSession(null);
          await storeUserProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          await storeSession(session);
          await refreshProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setSession(null);
          await storeSession(null);
          await storeUserProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          await storeSession(session);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};