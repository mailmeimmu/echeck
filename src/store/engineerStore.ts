import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { EngineerRequest, Booking } from '../types/engineer';

interface EngineerState {
  loading: boolean;
  error: string | null;
  bookings: Booking[];
  requestAccess: (request: EngineerRequest) => Promise<void>;
  fetchBookings: () => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  clearError: () => void;
}

export const useEngineerStore = create<EngineerState>((set) => ({
  loading: false,
  error: null,
  bookings: [],

  clearError: () => set({ error: null }),

  requestAccess: async (request) => {
    set({ loading: true, error: null });
    try {
      const { data: existingRequest, error: checkError } = await supabase
        .from('engineer_requests')
        .select('id, status')
        .or(`id_number.eq."${request.id_number}",email.eq."${request.email}"`)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingRequest) {
        throw new Error('تم تقديم طلب بهذا الرقم أو البريد الإلكتروني مسبقاً');
      }

      const { error: insertError } = await supabase
        .from('engineer_requests')
        .insert(request);

      if (insertError) throw insertError;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ ما';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          // Query for bookings that need engineer's attention
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              id,
              package:packages(name),
              property_type:property_types(name),
              location,
              booking_date,
              booking_time,
              notes,
              status,
              engineer_id
            `)
            .or(
              `and(status.eq.assigned,engineer_id.eq.${user.id}),and(status.eq.in_progress,engineer_id.eq.${user.id})`
            )
            .order('booking_date', { ascending: false });

          if (error) throw error;
          
          set({ bookings: data || [], loading: false });
          return;
        } catch (error) {
          retries++;
          if (retries === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch bookings';
      set({ error: message, loading: false });
    }
  },

  confirmBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'in_progress',
          engineer_id: user.id
        })
        .eq('id', bookingId)
        .eq('status', 'assigned');

      if (error) throw error;
      
      // Refresh bookings list after confirmation
      const { fetchBookings } = useEngineerStore.getState();
      await fetchBookings();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm booking';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));