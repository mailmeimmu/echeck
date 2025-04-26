import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface Booking {
  id: string;
  package_id: string;
  property_type_id: string;
  phone_number: string;
  location: string;
  notes?: string;
  booking_date: string;
  booking_time: string;
  status: string;
  package: { name: string };
  property_type: { name: string };
}

interface BookingState {
  bookings: Booking[];
  propertyTypes: { id: string; name: string; }[];
  selectedPackageId: string | null;
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  fetchPropertyTypes: () => Promise<void>;
  setSelectedPackageId: (id: string | null) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'package' | 'property_type'>) => Promise<void>;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  propertyTypes: [],
  selectedPackageId: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  setSelectedPackageId: (id) => set({ selectedPackageId: id }),

  fetchBookings: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        set({ bookings: [], loading: false });
        return;
      }

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
      
      set({ bookings: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set({ 
        error: 'حدث خطأ في تحميل الحجوزات. يرجى المحاولة مرة أخرى',
        loading: false 
      });
    }
  },

  fetchPropertyTypes: async () => {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ propertyTypes: data || [] });
    } catch (error) {
      console.error('Error fetching property types:', error);
    }
  },

  createBooking: async (booking) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    try {
      if (!booking.package_id || !booking.property_type_id || !booking.phone_number) {
        throw new Error('يرجى تعبئة جميع الحقول المطلوبة');
      }

      const phoneRegex = /^05[0-9]{8}$/;
      if (!phoneRegex.test(booking.phone_number)) {
        throw new Error('رقم الجوال غير صحيح');
      }

      const bookingDate = new Date(booking.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('لا يمكن حجز موعد في تاريخ سابق');
      }

      const [hours] = booking.booking_time.split(':').map(Number);
      if (hours < 9 || hours >= 22) {
        throw new Error('وقت الحجز يجب أن يكون بين الساعة 9 صباحاً و 10 مساءً');
      }

      const { error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          user_id: user.id,
          status: 'pending'
        }]);

      if (error) {
        if (error.message.includes('validate_booking')) {
          if (error.message.includes('past')) {
            throw new Error('لا يمكن حجز موعد في تاريخ سابق');
          }
          if (error.message.includes('working hours')) {
            throw new Error('وقت الحجز يجب أن يكون بين الساعة 9 صباحاً و 10 مساءً');
          }
          if (error.message.includes('concurrent booking')) {
            throw new Error('لديك حجز آخر في نفس الوقت');
          }
        }
        throw error;
      }
      
      await get().fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error instanceof Error 
        ? error 
        : new Error('حدث خطأ في إنشاء الحجز. يرجى المحاولة مرة أخرى');
    }
  },
}));