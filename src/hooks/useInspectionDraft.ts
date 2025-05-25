import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface SaveDraftOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useInspectionDraft = (bookingId: string, engineerId: string) => {
  const queryClient = useQueryClient();

  const draftQuery = useQuery({
    queryKey: ['inspectionDraft', bookingId],
    queryFn: async () => {
      if (!bookingId || !engineerId) return null;

      const { data, error } = await supabase
        .from('inspection_drafts')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('engineer_id', engineerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!bookingId && !!engineerId,
  });

  const saveDraft = useMutation({
    mutationFn: async (data: any, options?: SaveDraftOptions) => {
      if (!bookingId || !engineerId) return;

      // First check if a draft already exists
      const { data: existingDraft, error: checkError } = await supabase
        .from('inspection_drafts')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('engineer_id', engineerId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // If draft exists, update it
      if (existingDraft) {
        const { error: updateError } = await supabase
          .from('inspection_drafts')
          .update({ data })
          .eq('id', existingDraft.id);

        if (updateError) throw updateError;
        return;
      }

      // Otherwise insert a new draft
      const { error } = await supabase
        .from('inspection_drafts')
        .insert({
          booking_id: bookingId,
          engineer_id: engineerId,
          data
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
      return true;
    },
    onError: (error) => {
      console.error('Error saving draft:', error);
      return false;
    }
  });

  const deleteDraft = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('inspection_drafts')
        .delete()
        .eq('booking_id', bookingId)
        .eq('engineer_id', engineerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
  });

  return {
    draft: draftQuery.data,
    isLoading: draftQuery.isLoading,
    isSuccess: saveDraft.isSuccess,
    isError: draftQuery.isError,
    error: draftQuery.error,
    saveDraft: (data: any, options?: SaveDraftOptions) => {
      return saveDraft.mutate(data, {
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => options?.onError?.(error as Error)
      });
    },
    isSaving: saveDraft.isPending,
    deleteDraft: deleteDraft.mutate,
    isDeleting: deleteDraft.isPending,
  };
};