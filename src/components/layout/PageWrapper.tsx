import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from '../ui/BackButton';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

interface PageWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

const pageTransition = {
  initial: { opacity: 0, x: 0 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 0 },
  transition: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut'
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const PageWrapper = ({ children, showBackButton = true }: PageWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { loading } = useAuthStore();

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
    setIsDragging(true);
    if ('touches' in event) {
      setDragStart(event.touches[0].clientX);
    } else {
      setDragStart(event.clientX);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const swipe = swipePower(info.offset.x, info.velocity.x);
    
    if (swipe < -swipeConfidenceThreshold) {
      navigate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      navigate(-1);
    }
  };

  useEffect(() => {
    // Prevent body scroll when loading
    document.body.style.overflow = loading ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageTransition}
        layoutId="page"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`min-h-screen bg-gray-50 transition-all will-change-transform ${
          isDragging ? 'cursor-grabbing touch-none' : ''
        }`}
        style={{
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        {showBackButton && location.pathname !== '/' && <BackButton />}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};