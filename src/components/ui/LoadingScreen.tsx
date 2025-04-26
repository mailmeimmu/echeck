import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center z-50"
  >
    <motion.div
      animate={{ 
        rotate: 360,
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        rotate: { duration: 1, repeat: Infinity },
        scale: { duration: 1, repeat: Infinity }
      }}
      className="mb-4"
    >
      <Package className="w-16 h-16 text-emerald-600" />
    </motion.div>
    
    <motion.h1
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold text-emerald-600"
    >
      شيك
    </motion.h1>
  </motion.div>
);