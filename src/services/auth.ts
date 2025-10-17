import { supabase } from './supabase';
import { SignUpData, SignInData, UserRole } from '../types';

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData) {
    try {
      const { email, password, full_name, role, ...additionalData } = data;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role,
            ...additionalData,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData) {
    try {
      const { email, password } = data;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get the current session
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Get the current user's profile from the users table
   */
  static async getUserProfile(userId?: string) {
    try {
      const currentUser = userId || (await this.getCurrentUser())?.id;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // First, try to get the profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser)
        .single();

      if (profile && !profileError) {
        // Now fetch user role from user_organizations (handle multiple roles by taking first)
        const { data: roleData, error: roleError } = await supabase
          .from('user_organizations')
          .select('role')
          .eq('user_id', currentUser)
          .limit(1);

        if (!roleError && roleData && roleData.length > 0) {
          const role = roleData[0].role;
          return { ...profile, role };
        }

        // If no role found, return profile without role
        console.warn('No role found for user:', currentUser);
        return { ...profile, role: null };
      }
      
      // Fallback: Use current auth user data and create profile if needed
      const authUser = await this.getCurrentUser();
      
      if (authUser) {
        // Try to create the missing user record in the database
        try {
          const newUserData = {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: authUser.user_metadata?.role || 'trainer',
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: createdUser, error: createError } = await supabase
            .from('profiles')
            .insert(newUserData)
            .select()
            .single();

          if (!createError && createdUser) {
            return createdUser;
          }
        } catch (insertError) {
          // Continue to fallback
        }

        // If database insert fails, return auth metadata as fallback
        return {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: authUser.user_metadata?.role || 'trainer',
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone_number: null,
          date_of_birth: null,
          emergency_contact_name: null,
          weight_kg: null,
          location: null,
          preferred_language: null,
        };
      } else {
        throw new Error('No user data available');
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile
   */
  static async updateUserProfile(updates: Partial<{
    name: string;
    role: UserRole;
    date_of_birth: string;
    gender: string;
    height_cm: number;
    weight_kg: number;
    location: string;
    preferred_language: string;
  }>) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}