import { motion } from 'framer-motion';
import { ReportsList } from '../../components/admin/ReportsList';

export const ReportsPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">تقارير الفحص</h1>
        <ReportsList />
      </motion.div>
    </div>
  );
};