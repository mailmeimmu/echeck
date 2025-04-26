import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookingsList } from '../components/engineer/BookingsList';
import { InspectionForm } from '../components/engineer/InspectionForm';
import { useEngineerStore } from '../store/engineerStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { ArrowRight, AlertCircle } from 'lucide-react';

export const EngineerDashboard = () => {
  const { fetchBookings, loading, error, bookings, clearError } = useEngineerStore();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="mb-6 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <Button onClick={() => {
          clearError();
          fetchBookings();
        }}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (selectedBooking) {
    return (
      <div className="p-6">
        <Button 
          onClick={() => setSelectedBooking(null)}
          variant="outline"
          className="mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة للطلبات</span>
        </Button>

        <InspectionForm 
          bookingId={selectedBooking.id}
          propertyType={selectedBooking.property_type.name}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-2">لوحة تحكم المهندس</h1>
        <p className="text-gray-600">إدارة طلبات الفحص والمعاينة</p>
      </motion.div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8 bg-gray-50 rounded-2xl"
        >
          <p className="text-gray-600">لا توجد طلبات فحص حالياً</p>
        </motion.div>
      ) : (
        <BookingsList onSelectBooking={setSelectedBooking} />
      )}
    </div>
  );
};