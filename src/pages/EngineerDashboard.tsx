import { motion, AnimatePresence } from 'framer-motion';
import { BookingsList } from '../components/engineer/BookingsList';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEngineer } from '../hooks/useEngineer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface EngineerLayoutContext {
  setShowInspectionForm: (show: boolean) => void;
}

export const EngineerDashboard = () => {
  const { user } = useAuthStore();
  const { setShowInspectionForm } = useOutletContext<EngineerLayoutContext>();
  const { data: engineer, isLoading, error } = useEngineer(user?.id);
  const [showBookings, setShowBookings] = useState(true);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !engineer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 text-center"
      >
        <p className="text-red-600">حدث خطأ في تحميل البيانات</p>
      </motion.div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-2">
          مرحباً {engineer.profiles.first_name}
        </h1>
        <p className="text-gray-600">إدارة طلبات الفحص والمعاينة</p>
      </motion.div>

      {showBookings && <BookingsList />}
    </div>
  );
};