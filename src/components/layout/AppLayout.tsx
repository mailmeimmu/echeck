import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export const AppLayout = ({ children, hideNav }: AppLayoutProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-gray-50 pb-20"
  >
    <div className="max-w-lg mx-auto">
      {children}
    </div>
    {!hideNav && <BottomNav />}
  </motion.div>
);