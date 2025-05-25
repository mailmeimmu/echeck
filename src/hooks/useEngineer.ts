import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useEngineer = (userId?: string) => {
  return useQuery({
    queryKey: ['engineer', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('engineers')
        .select(`
          *,
          profiles!engineers_user_id_fkey(
            email,
            first_name
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};