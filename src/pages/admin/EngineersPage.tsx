import { motion } from 'framer-motion';
import EngineerRequests from '../../components/admin/EngineerRequests';
import { EngineerList } from '../../components/admin/EngineerList';

export const EngineersPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">إدارة المهندسين</h1>
        
        <div className="space-y-8">
          <EngineerRequests />
          <EngineerList />
        </div>
      </motion.div>
    </div>
  );
};