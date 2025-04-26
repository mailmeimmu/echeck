import { motion } from 'framer-motion';

export const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <motion.div
      className="w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);