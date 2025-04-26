import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProfileForm } from '../components/profile/ProfileForm';
import { BookingsList } from '../components/home/BookingsList';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { signOut } = useAuthStore();
  const { fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="p-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProfileForm />
        <BookingsList />
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={signOut}
            variant="secondary"
            className="w-full"
          >
            تسجيل الخروج
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};