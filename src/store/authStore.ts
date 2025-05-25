import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { checkEngineerStatus } from '../utils/engineer';

interface User {
  id: string;
  email: string;
  first_name?: string;
  avatar_url?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isEngineer: boolean;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  signUp: (email: string, password: string, firstName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ isEngineer: boolean; isAdmin: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const createOrUpdateProfile = async (userId: string, email: string, firstName?: string) => {
  try {
    // First try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // If no profile exists or there was an error (other than "no rows")
    if (!existingProfile || (fetchError && !fetchError.message.includes('no rows found'))) {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          email,
          first_name: firstName || email.split('@')[0]
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newProfile;
    }

    // If profile exists but firstName is provided and different, update it
    if (firstName && existingProfile.first_name !== firstName) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ first_name: firstName })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return updatedProfile;
    }

    return existingProfile;
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
    throw error;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  isEngineer: false,
  
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized, loading: false }),
  
  signIn: async (email, password) => {
    try {
      console.log('Starting sign in process for:', email);
      
      // First attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        throw error;
      }
      
      if (!data.user) {
        console.error('No user data returned from auth');
        throw new Error('فشل تسجيل الدخول');
      }

      console.log('Auth successful, checking roles...');

      // Check roles in parallel
      const [{ data: engineerData }, { data: adminData }] = await Promise.all([
        supabase
          .from('engineers')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()
      ]);

      console.log('Role check results:', { engineerData, adminData });

      const profile = await createOrUpdateProfile(data.user.id, email);
      const isEngineer = !!engineerData;
      const isAdmin = !!adminData;
      
      console.log('Final role determination:', { isEngineer, isAdmin });

      set({ 
        user: profile,
        isEngineer,
        isAdmin,
        loading: false,
        initialized: true
      });

      return { isEngineer, isAdmin };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  
  signUp: async (email, password, firstName) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
          },
        },
      });
      
      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('البريد الإلكتروني مسجل مسبقاً');
        }
        throw signUpError;
      }
      
      if (!data.user) {
        throw new Error('فشل إنشاء الحساب');
      }

      const profile = await createOrUpdateProfile(data.user.id, email, firstName);
      set({ user: profile, isEngineer: false });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      set({ user: null, isEngineer: false });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
  
  updateProfile: async (data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('لا توجد جلسة نشطة');
      }

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        if (error.message.includes('User not found')) {
          throw new Error('البريد الإلكتروني غير مسجل في النظام');
        }
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
}));

// Initialize auth state
(async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
    useAuthStore.setState({
      user: null,
      isEngineer: false,
      loading: false,
      initialized: true
    });
    return;
  }

  if (!session?.user) {
    useAuthStore.setState({
      user: null,
      isEngineer: false,
      loading: false,
      initialized: true
    });
    return;
  }

  try {
    // Check if refresh token exists before attempting refresh
    if (!session.refresh_token) {
      console.warn('No refresh token found, clearing auth state');
      useAuthStore.setState({
        user: null,
        isEngineer: false,
        loading: false,
        initialized: true
      });
      return;
    }

    // Only attempt to refresh if we have a valid access token
    if (session.access_token) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      // Handle specific refresh token errors
      if (refreshError) {
        console.warn('Session refresh error:', refreshError.message);
        if (refreshError.message.includes('refresh_token_not_found') || 
            refreshError.message.includes('Invalid Refresh Token')) {
          useAuthStore.setState({
            user: null,
            isEngineer: false,
            loading: false,
            initialized: true
          });
          return;
        }
      }
    }

    // Get fresh session after potential refresh
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (!freshSession) {
      console.warn('No fresh session available after refresh');
      useAuthStore.setState({
        user: null,
        isEngineer: false,
        loading: false,
        initialized: true
      });
      return;
    }

    const profile = await createOrUpdateProfile(freshSession.user.id, freshSession.user.email);
    const { data: engineerData } = await supabase
      .from('engineers')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .maybeSingle();

    useAuthStore.setState({ 
      user: profile,
      isEngineer: !!engineerData,
      loading: false,
      initialized: true
    });
  } catch (error) {
    console.error('Error initializing user data:', error);
    useAuthStore.setState({
      user: null,
      isEngineer: false,
      loading: false,
      initialized: true
    });
  }
})();