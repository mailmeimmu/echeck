import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, X, MapPin, Calendar, Clock } from 'lucide-react';

export const BookingsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

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
                : 'bg-gray-100 text-gray-700'
            }`}>
              {booking.status === 'completed'
                ? 'مكتمل'
                : booking.status === 'in_progress'
                ? 'جاري الفحص'
                : booking.status === 'open'
                ? 'متاح للمهندسين'
                : 'قيد المراجعة'}
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
                onClick={() => handleAssignEngineer(booking.id, 'ENGINEER_ID')}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تعيين مهندس</span>
              </Button>

              <Button
                variant="secondary"
                className="flex-1"
              >
                <X className="w-4 h-4" />
                <span>رفض</span>
              </Button>
            </div>
          )}
        </motion.div>
      ))}

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