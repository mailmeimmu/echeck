import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { checkEngineerStatus } from './engineer';
import { withRetry } from './databaseHelpers';

const createProfileIfNeeded = async (userId: string, email: string, firstName?: string) => {
  try {
    // Use withRetry for better error handling
    return await withRetry(async () => {
      // First check if profile exists using RPC
      try {
        const { data: existingProfile, error: fetchError } = await supabase.rpc('get_user_profile', {
          p_user_id: userId
        });

        if (fetchError) {
          if (fetchError.message.includes('not found')) {
            // Profile doesn't exist, create it
            throw new Error('Profile not found');
          }
          throw fetchError;
        }

        return existingProfile;
      } catch (error) {
        // If profile doesn't exist or there was an error fetching it, create a new one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert([{
            id: userId,
            email,
            first_name: firstName || email.split('@')[0]
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }
    }, 5);
  } catch (error) {
    console.error('Error in createProfileIfNeeded:', error);
    return null;
  }
};

const clearAuthState = async () => {
  try {
    // Clear all auth-related items from localStorage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('supabase.auth.') || 
      key.includes('token') ||
      key.includes('refresh')
    );
    
    authKeys.forEach(key => localStorage.removeItem(key));
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Reset auth store state
    useAuthStore.setState({ 
      user: null,
      isEngineer: false,
      loading: false,
      initialized: true
    });
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

const initializeUserData = async (session: any) => {
  try {
    const [profile, isEngineer] = await Promise.all([
      createProfileIfNeeded(session.user.id, session.user.email!),
      checkEngineerStatus(session.user.id)
    ]);

    if (!profile) {
      throw new Error('Failed to initialize user data');
    }

    return { profile, isEngineer };
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
};

export const initAuth = async () => {
  useAuthStore.setState({ loading: true });

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      await clearAuthState();
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
        await clearAuthState();
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
            await clearAuthState();
            return;
          }
        }
      }

      // Get fresh session after potential refresh
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      if (!freshSession) {
        console.warn('No fresh session available after refresh');
        await clearAuthState();
        return;
      }

      const { profile, isEngineer } = await initializeUserData(freshSession);

      useAuthStore.setState({ 
        user: profile,
        isEngineer,
        loading: false,
        initialized: true
      });
    } catch (error) {
      console.error('Error initializing user data:', error);
      await clearAuthState();
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        await clearAuthState();
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        // Verify the refreshed session is valid
        if (!session?.access_token || !session?.refresh_token) {
          console.warn('Invalid refreshed session');
          await clearAuthState();
          return;
        }
        return;
      }

      if (session?.user) {
        useAuthStore.setState({ loading: true });
        try {
          const { profile, isEngineer } = await initializeUserData(session);
          useAuthStore.setState({
            user: profile,
            isEngineer,
            loading: false
          });
        } catch (error) {
          console.error('Error updating user profile:', error);
          await clearAuthState();
        }
      }
    });

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Auth initialization error:', error);
    await clearAuthState();
  }
};