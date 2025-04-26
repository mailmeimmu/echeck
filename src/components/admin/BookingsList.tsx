import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, X, MapPin, Calendar, Clock, Users } from 'lucide-react';

export const BookingsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [showEngineerModal, setShowEngineerModal] = useState<string | null>(null);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error: engineersError } = await supabase
        .from('engineers')
        .select(`
          id,
          status,
          profiles:user_id(
            first_name,
            email
          )
        `)
        .eq('status', 'active');

      if (engineersError) throw engineersError;
      setEngineers(data || []);
    } catch (error) {
      console.error('Error fetching engineers:', error);
      setError('حدث خطأ في تحميل قائمة المهندسين');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          engineer:engineers(
            id,
            user_id,
            profiles:user_id(
              first_name
            )
          ),
          property_type:property_types(
            name
          ),
          package:packages(
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('حدث خطأ في تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEngineer = async (bookingId: string, engineerId: string) => {
    try {
      const { error } = await supabase.rpc('approve_engineer_booking', {
        p_booking_id: bookingId,
        p_engineer_id: engineerId
      });

      if (error) throw error;
      
      await fetchBookings();
    } catch (error) {
      console.error('Error assigning engineer:', error);
      setError('حدث خطأ في تعيين المهندس');
    }
  };

  const handleApproveBooking = async (bookingId: string, engineerId: string) => {
    try {
      setProcessingBooking(bookingId);
      setError(null);

      const { error } = await supabase.rpc('approve_engineer_booking', {
        p_booking_id: bookingId,
        p_engineer_id: engineerId
      });

      if (error) throw error;
      await fetchBookings();
    } catch (error: any) {
      console.error('Error approving booking:', error);
      setError(error.message || 'حدث خطأ في الموافقة على الحجز');
      await fetchBookings();
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setProcessingBooking(bookingId);
      setError(null);

      // Check if the booking can be rejected
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      if (!bookingData || !['pending', 'open'].includes(bookingData.status)) {
        setError('لا يمكن رفض هذا الحجز. قد يكون تم تحديثه بالفعل.');
        await fetchBookings();
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchBookings();
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      setError(error.message || 'حدث خطأ في رفض الحجز');
      await fetchBookings();
    } finally {
      setProcessingBooking(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {booking.package?.name || 'غير محدد'}
              </h3>
              <p className="text-emerald-600">
                {booking.package?.price ? `${booking.package.price} ريال` : 'السعر غير محدد'}
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : booking.status === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : booking.status === 'open'
                ? 'bg-amber-100 text-amber-700'
                : booking.status === 'pending'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {booking.status === 'completed'
                ? 'مكتمل'
                : booking.status === 'in_progress'
                ? 'جاري الفحص'
                : booking.status === 'open'
                ? 'بانتظار تعيين مهندس'
                : booking.status === 'pending'
                ? 'قيد المراجعة'
                : 'مرفوض'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{booking.location || 'الموقع غير محدد'}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('ar-SA') : 'التاريخ غير محدد'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{booking.booking_time || 'الوقت غير محدد'}</span>
              </div>
            </div>
          </div>

          {booking.engineer?.profiles?.first_name && (
            <div className="p-3 bg-emerald-50 rounded-lg mb-4">
              <p className="text-emerald-700">
                المهندس: {booking.engineer.profiles.first_name}
              </p>
            </div>
          )}

          {booking.status === 'open' && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowEngineerModal(booking.id)}
                className="flex-1"
                disabled={processingBooking === booking.id}
              >
                <Users className="w-4 h-4" />
                <span>تعيين مهندس</span>
              </Button>
              
              <Button
                onClick={() => handleRejectBooking(booking.id)}
                variant="secondary"
                className="flex-1"
                disabled={processingBooking === booking.id}
              >
                <X className="w-4 h-4" />
                <span>رفض</span>
              </Button>
            </div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {showEngineerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEngineerModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">اختر المهندس</h3>
              
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {engineers.map((engineer) => (
                  <motion.button
                    key={engineer.id}
                    onClick={() => {
                      handleApproveBooking(showEngineerModal, engineer.id);
                      setShowEngineerModal(null);
                    }}
                    className="w-full p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors text-right"
                  >
                    <div className="font-semibold">{engineer.profiles.first_name}</div>
                    <div className="text-sm text-gray-500">{engineer.profiles.email}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};