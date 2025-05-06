import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  account_type: 'individual' | 'corporate';
  subscription_tier?: string;
  phone_number?: string;
  address?: string;
  location?: string;
  // Individual specific
  household_adults?: number;
  hasChildren?: boolean;
  hasPets?: boolean;
  has_pets?: boolean;
  number_of_household_members?: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  live_in_accommodation?: 'Required' | 'Non Required';
  preferred_contact?: 'Call' | 'WhatsApp';
  // Corporate specific
  company_name?: string;
  rc_number?: string;
  industry?: string;
  company_address?: string;
  company_city_state?: string;
  company_email?: string;
  company_phone?: string;
  website?: string;
  representative_details?: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  account_status?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, accountType: 'individual' | 'corporate') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => {
    set({ user });
    if (!user) {
      set({ profile: null, loading: false });
    }
  },

  setProfile: (profile) => set({ profile, loading: false }),

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user });

      // Fetch profile after successful sign in
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) throw profileError;

      set({ profile, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error signing in:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string, accountType: 'individual' | 'corporate') => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('users_profile').insert({
          user_id: data.user.id,
          email: data.user.email,
          account_type: accountType,
          subscription_tier: 'free',
          account_status: 'active'
        });

        if (profileError) throw profileError;

        set({ user: data.user, loading: false });
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error signing up:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error signing out:', error);
      throw error;
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('users_profile')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });
      toast.success('Profile updated successfully');
    } catch (error) {
      set({ loading: false });
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ profile: null, loading: false });
      return;
    }

    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
}));