import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['propertyTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // Consider property types fresh for 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // Cache property types for 24 hours
  });
};