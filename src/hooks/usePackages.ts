import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const usePackages = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // Consider packages fresh for 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // Cache packages for 24 hours
  });
};