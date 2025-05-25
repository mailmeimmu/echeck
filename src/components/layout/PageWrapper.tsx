import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from '../ui/BackButton';
import { useState } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

const pageTransition = {
  initial: { opacity: 0, x: 0 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 0 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 0.5
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageTransition}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`min-h-screen bg-gray-50 transition-all ${
          isDragging ? 'cursor-grabbing touch-none' : ''
        }`}
        style={{
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        {showBackButton && location.pathname !== '/' && <BackButton />}
        {children}
      </motion.div>
    </AnimatePresence>
  );
};