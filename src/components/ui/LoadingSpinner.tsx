import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ className = "", fullScreen = true }: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[200]">
        <motion.div
          className={`w-16 h-16 border-8 border-emerald-500 rounded-full border-t-transparent ${className}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  
  return (
    <motion.div
      className={`w-8 h-8 border-4 border-emerald-500 rounded-full border-t-transparent ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};