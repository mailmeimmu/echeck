import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useInspectionDraft = (bookingId: string, engineerId: string) => {
  const queryClient = useQueryClient();

  const draftQuery = useQuery({
    queryKey: ['inspectionDraft', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspection_drafts')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('engineer_id', engineerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const saveDraft = useMutation({
    mutationFn: async (data: any) => {
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
    saveDraft: saveDraft.mutate,
    isSaving: saveDraft.isPending,
    deleteDraft: deleteDraft.mutate,
    isDeleting: deleteDraft.isPending,
  };
};