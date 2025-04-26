import { motion } from 'framer-motion';
import { EngineerNav } from './EngineerNav';

interface EngineerLayoutProps {
  children: React.ReactNode;
}

export const EngineerLayout = ({ children }: EngineerLayoutProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-gray-50 pb-20 pt-12"
  >
    <div className="max-w-lg mx-auto">
      {children}
    </div>
    <EngineerNav />
  </motion.div>
);