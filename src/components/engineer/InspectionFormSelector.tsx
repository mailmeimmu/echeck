import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import { InspectionForm } from './InspectionForm';

interface InspectionFormSelectorProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionFormSelector = ({ bookingId, onComplete }: InspectionFormSelectorProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Scroll to top when form opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // If a type is selected, render the appropriate form
  if (selectedType) {
    return <InspectionForm bookingId={bookingId} onComplete={onComplete} />;
  }

  // Otherwise, show the type selector
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">اختر نوع العقار</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('villa')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Home className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">فيلا</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('apartment')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Building2 className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">شقة</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('land')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Map className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">أرض</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('building')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Building className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">عمارة</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('office')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <FileText className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">مكتب</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('storage')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Warehouse className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">مستودع</span>
          </motion.button>
        </div>
        
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedType('all')}
            className="w-full p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-700 font-medium"
          >
            عرض جميع الأنواع
          </motion.button>
        </div>
        
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="w-full p-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            إلغاء
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};