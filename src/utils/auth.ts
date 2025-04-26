import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { checkEngineerStatus } from './engineer';

const createProfileIfNeeded = async (userId: string, email: string, firstName?: string) => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return null;
    }

    if (existingProfile) {
      return existingProfile;
    }

    // If no profile exists, create one
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert([{ 
        id: userId, 
        email, 
        first_name: firstName || email.split('@')[0]
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in createProfileIfNeeded:', error);
    return null;
  }
};

const clearAuthState = async () => {
  // Clear all local storage to remove any invalid tokens
  localStorage.clear();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Reset auth store state
  useAuthStore.setState({ 
    user: null,
    isEngineer: false,
    loading: false,
    initialized: true
  });
};

export const initAuth = async () => {
  useAuthStore.setState({ loading: true });

  try {
    // First check if there's an existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      await clearAuthState();
      return;
    }

    // If no session exists, set initial state and return
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
      // Only attempt to refresh if we have a valid access token
      if (session.access_token) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        // If refresh fails, clear auth state and sign out
        if (refreshError) {
          console.warn('Session refresh error:', refreshError.message);
          await clearAuthState();
          return;
        }
      }

      // Get fresh session after potential refresh
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      if (!freshSession) {
        throw new Error('No session available');
      }

      const [profile, isEngineer] = await Promise.all([
        createProfileIfNeeded(freshSession.user.id, freshSession.user.email!),
        checkEngineerStatus(freshSession.user.id)
      ]);

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
        useAuthStore.setState({ 
          user: null, 
          isEngineer: false,
          loading: false 
        });
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        // Session was refreshed successfully, no need to do anything
        return;
      }

      if (session?.user) {
        useAuthStore.setState({ loading: true });
        try {
          const [profile, isEngineer] = await Promise.all([
            createProfileIfNeeded(session.user.id, session.user.email!),
            checkEngineerStatus(session.user.id)
          ]);

          useAuthStore.setState({ 
            user: profile,
            isEngineer,
            loading: false 
          });
        } catch (error) {
          console.error('Error updating user profile:', error);
          useAuthStore.setState({ loading: false });
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