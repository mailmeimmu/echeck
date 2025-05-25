import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useBookings = () => {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          package_id,
          property_type_id,
          phone_number,
          location,
          notes,
          booking_date,
          booking_time,
          status,
          package:packages!bookings_package_id_fkey(name),
          property_type:property_types!bookings_property_type_id_fkey(name)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          user_id: session.user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoading: bookingsQuery.isLoading,
    isError: bookingsQuery.isError,
    error: bookingsQuery.error,
    createBooking: createBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
  };
};