import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Improved hook with better error handling and retry logic
export const useInspectionDraft = (bookingId: string, engineerId: string) => {
  const queryClient = useQueryClient();

  const draftQuery = useQuery({
    queryKey: ['inspectionDraft', bookingId],
    queryFn: async () => {
      try {
        // Add retry logic for fetching drafts
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;
        
        while (attempts < maxAttempts) {
          try {
            const { data, error } = await supabase
              .from('inspection_drafts')
              .select('*')
              .eq('booking_id', bookingId)
              .eq('engineer_id', engineerId)
              .single();

            if (error) {
              if (error.code === 'PGRST116') {
                // No data found, not an error
                return null;
              }
              throw error;
            }
            
            return data;
          } catch (error) {
            lastError = error;
            attempts++;
            
            // Only retry on connection errors
            if (error instanceof Error && 
                (error.message.includes('network') || 
                 error.message.includes('connection') ||
                 error.message.includes('timeout'))) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              continue;
            }
            
            // For other errors, throw immediately
            throw error;
          }
        }
        
        // If we've exhausted retries, throw the last error
        throw lastError;
      } catch (error) {
        console.error('Error fetching inspection draft:', error);
        throw error;
      }
    },
    // Add retry configuration
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const saveDraft = useMutation({
    mutationFn: async (data: any) => {
      try {
        // Use the RPC function for more reliable upserts
        const { error } = await supabase.rpc('upsert_inspection_draft', {
          p_booking_id: bookingId,
          p_engineer_id: engineerId,
          p_data: data
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving inspection draft:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
    // Add retry configuration for mutations
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const deleteDraft = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase
          .from('inspection_drafts')
          .delete()
          .eq('booking_id', bookingId)
          .eq('engineer_id', engineerId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting inspection draft:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
    // Add retry configuration for mutations
    retry: 2,
  });

  return {
    draft: draftQuery.data,
    isLoading: draftQuery.isLoading,
    isError: draftQuery.isError,
    error: draftQuery.error,
    saveDraft: saveDraft.mutate,
    isSaving: saveDraft.isPending,
    deleteDraft: deleteDraft.mutate,
    isDeleting: deleteDraft.isPending,
  };
};