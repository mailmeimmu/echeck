import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import { StandardInspectionForm } from './StandardInspectionForm';

interface InspectionFormProps {
  bookingId: string;
  onComplete?: () => void;
}

export const AllPropertyTypesForm = (props: InspectionFormProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Force scroll to top when the form opens
  useEffect(() => {
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scrolling when form closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (selectedType) {
    return <StandardInspectionForm {...props} propertyType={selectedType} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={props.onComplete}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 my-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">اختر نوع العقار</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('فيلا')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Home className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">فيلا</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('شقة')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Building2 className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">شقة</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('أرض')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Map className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">أرض</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('مبنى')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Building className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">مبنى</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('مكتب')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <FileText className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">مكتب</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType('مستودع')}
            className="p-4 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Warehouse className="w-10 h-10 text-emerald-600" />
            <span className="font-medium">مستودع</span>
          </motion.button>
        </div>
        
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={props.onComplete}
            className="w-full p-3 text-gray-500 hover:text-gray-700 transition-colors font-medium rounded-xl hover:bg-gray-50"
          >
            إلغاء
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};