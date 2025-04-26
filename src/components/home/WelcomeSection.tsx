import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Package } from 'lucide-react';

export const WelcomeSection = () => {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="inline-block mb-4"
      >
        <Package className="w-16 h-16 text-emerald-600" />
      </motion.div>
      
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 mb-4">
        مرحباً {user?.first_name}!
      </h1>
      <p className="text-gray-600 text-lg">
        نحن هنا لمساعدتك في فحص عقارك بأعلى معايير الجودة
      </p>
    </motion.div>
  );
};