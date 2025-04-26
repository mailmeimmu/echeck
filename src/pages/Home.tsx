import { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { WelcomeSection } from '../components/home/WelcomeSection';
import { BookingsList } from '../components/home/BookingsList';
import { BookingForm } from '../components/home/BookingForm';
import { useBookingStore } from '../store/bookingStore';
import { usePackageStore } from '../store/packageStore';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const { fetchBookings, fetchPropertyTypes, bookings } = useBookingStore();
  const { fetchPackages } = usePackageStore();

  useEffect(() => {
    fetchBookings();
    fetchPropertyTypes();
    fetchPackages();
  }, [fetchBookings, fetchPropertyTypes, fetchPackages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-6">
        <WelcomeSection />
        
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 p-8 bg-white rounded-2xl shadow-sm"
          >
            <p className="text-gray-600 text-lg mb-4">
              لا يوجد لديك حجوزات حالياً
            </p>
            <p className="text-emerald-600">
              قم بإنشاء حجزك الأول من النموذج أدناه
            </p>
          </motion.div>
        ) : (
          <BookingsList />
        )}
        
        <BookingForm />
      </div>
    </div>
  );
};