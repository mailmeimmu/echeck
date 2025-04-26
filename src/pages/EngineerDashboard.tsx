import { motion } from 'framer-motion';
import { BookingsList } from '../components/engineer/BookingsList'; 
import { useOutletContext } from 'react-router-dom';

interface EngineerLayoutContext {
  setShowInspectionForm: (show: boolean) => void;
}

export const EngineerDashboard = () => {
  const { setShowInspectionForm } = useOutletContext<EngineerLayoutContext>();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-2">لوحة تحكم المهندس</h1>
        <p className="text-gray-600">إدارة طلبات الفحص والمعاينة</p>
      </motion.div>

      <BookingsList />
    </div>
  );
};