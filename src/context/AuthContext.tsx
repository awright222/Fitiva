import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await AuthService.getUserProfile(user.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await AuthService.signIn({ email, password });
      // The auth state change listener will handle setting the user
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: any) => {
    try {
      setIsLoading(true);
      await AuthService.signUp(data);
      // The auth state change listener will handle setting the user
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
      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await AuthService.getSession();
        setSession(session);
        if (session?.user) {
          setUser(session.user);
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          await refreshProfile();
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
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