import { motion, AnimatePresence } from 'framer-motion';
import { useBookings } from '../../hooks/useBookings';
import { Calendar, Clock, Package, Building, MapPin, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useState } from 'react';
import { ReportViewer } from './ReportViewer';
import { supabase } from '../../lib/supabase';

export const BookingsList = () => {
  const { bookings, isLoading, isError, error } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [bookingsWithReports, setBookingsWithReports] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('inspections')
          .select('booking_id')
          .in('booking_id', bookings.map(b => b.id));

        if (error) throw error;
        setBookingsWithReports(data.map(d => d.booking_id));
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    if (bookings.length > 0) {
      fetchReports();
    }
  }, [bookings]);
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-red-50 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <p>{error instanceof Error ? error.message : 'حدث خطأ في تحميل الحجوزات'}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>إعادة المحاولة</span>
        </Button>
      </motion.div>
    );
  }

  if (!bookings.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-gray-50 rounded-2xl"
      >
        <p className="text-gray-600">لا توجد حجوزات حالياً</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold mb-6">حجوزاتك</h2>
        
        <AnimatePresence>
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-lg">
                    {booking.package.name}
                  </span>
                </div>
                
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  booking.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : booking.status === 'confirmed'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {booking.status === 'completed' 
                    ? 'مكتمل'
                    : booking.status === 'confirmed'
                    ? 'مؤكد'
                    : 'قيد المراجعة'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Building className="w-5 h-5" />
                  </div>
                  <span>{booking.property_type.name}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>{booking.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.booking_date).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{booking.booking_time}</span>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              {bookingsWithReports.includes(booking.id) && (
                <Button
                  onClick={() => {
                    setSelectedBooking(booking.id);
                    setShowReportModal(true);
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <FileText className="w-5 h-5" />
                  <span>عرض تقرير الفحص</span>
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showReportModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <ReportViewer 
                bookingId={selectedBooking} 
                onClose={() => setShowReportModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};