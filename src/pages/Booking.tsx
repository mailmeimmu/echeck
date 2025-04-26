import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookingForm } from '../components/home/BookingForm';
import { useBookingStore } from '../store/bookingStore';
import { usePackageStore } from '../store/packageStore';

export const BookingPage = () => {
  const { fetchPropertyTypes } = useBookingStore();
  const { fetchPackages } = usePackageStore();

  useEffect(() => {
    fetchPropertyTypes();
    fetchPackages();
  }, [fetchPropertyTypes, fetchPackages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">حجز جديد</h1>
      <BookingForm />
    </motion.div>
  );
};