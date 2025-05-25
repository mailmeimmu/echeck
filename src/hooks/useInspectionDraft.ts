import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface DraftData {
  answers: Record<string, any>;
  photos: Record<string, string[]>;
  notes: Record<string, string>;
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
    mutationFn: async (data: DraftData) => {
      if (!bookingId || !engineerId) return;

      const { error } = await supabase
        .from('inspection_drafts')
        .upsert({
          booking_id: bookingId,
          engineer_id: engineerId,
          data
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionDraft', bookingId] });
    },
  });

  const deleteDraft = useMutation({
    mutationFn: async () => {
      if (!bookingId || !engineerId) return;

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
    isError: draftQuery.isError,
    error: draftQuery.error,
    saveDraft: saveDraft.mutate,
    isSaving: saveDraft.isPending,
    deleteDraft: deleteDraft.mutate,
    isDeleting: deleteDraft.isPending,
  };
};