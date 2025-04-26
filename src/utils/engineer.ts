import { supabase } from '../lib/supabase';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

export const getEngineerDetails = async (userId: string) => {
  if (!userId) return false;
  
  let retries = 0;
  
  const attemptCheck = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*, profiles(email, first_name)')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Check if error is retryable
        if (error.message?.includes('Failed to fetch') && retries < MAX_RETRIES) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY * retries));
          return attemptCheck();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking engineer status:', error);
      
      // If we've exhausted retries, return false rather than throwing
      if (retries >= MAX_RETRIES) {
        return false;
      }
      
      // For network errors, retry
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY * retries));
        return attemptCheck();
      }
      
      return false;
    }
  };

  return attemptCheck();
};

// Add alias for backward compatibility
export const checkEngineerStatus = getEngineerDetails;