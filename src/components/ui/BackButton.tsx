import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();

  const buttonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.9
    }
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      onClick={() => navigate(-1)}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-100/50"
      aria-label="رجوع"
    >
      <ArrowRight className="w-5 h-5 text-gray-600" />
    </motion.button>
  );
};