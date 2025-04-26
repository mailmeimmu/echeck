import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';

interface PackageModalProps {
  id: string;
  name: string;
  price: number;
  features_count: number;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PackageModal = ({ 
  id,
  name, 
  price, 
  features_count, 
  description, 
  isOpen, 
  onClose 
}: PackageModalProps) => {
  const { user } = useAuthStore();
  const { setSelectedPackageId } = useBookingStore();
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!user) {
      navigate('/auth');
    } else {
      setSelectedPackageId(id);
      navigate('/booking');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{name}</h3>
              <button onClick={onClose}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-3xl font-bold text-emerald-600">
                {price.toLocaleString()} ريال
              </p>
              <p className="text-gray-600">
                {features_count} خدمات هندسية
              </p>
              <p className="text-gray-700">{description}</p>
              
              <button
                onClick={handleBooking}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                {user ? 'احجز الآن' : 'تسجيل الدخول للحجز'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};