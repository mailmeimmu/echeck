import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { withRetry } from '../utils/databaseHelpers';

export const useInspectionDraft = (bookingId: string, engineerId: string) => {
  const queryClient = useQueryClient();

  const draftQuery = useQuery({
    queryKey: ['inspectionDraft', bookingId],
    queryFn: async () => {
      return await withRetry(async () => {
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
      }, 5);
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a "not found" error
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  const saveDraft = useMutation({
    mutationFn: async (data: any) => {
      try {
        await withRetry(async () => {
          // Use the RPC function for more reliable upserts
          const { error } = await supabase.rpc('upsert_inspection_draft', {
            p_booking_id: bookingId,
            p_engineer_id: engineerId,
            p_data: data
          });

          if (error) throw error;
          return true;
        }, 5);
      } catch (error) {
        console.error('Error saving inspection draft:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
    retry: 5,
    retryDelay: (attemptIndex) => {
      // Exponential backoff with jitter
      return Math.min(1000 * Math.pow(2, attemptIndex) + Math.random() * 1000, 15000);
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async () => {
      try {
        await withRetry(async () => {
          const { error } = await supabase
            .from('inspection_drafts')
            .delete()
            .eq('booking_id', bookingId)
            .eq('engineer_id', engineerId);

          if (error) throw error;
          return true;
        }, 3);
      } catch (error) {
        console.error('Error deleting inspection draft:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
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