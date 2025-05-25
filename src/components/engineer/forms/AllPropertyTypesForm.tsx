import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import { VillaInspectionForm } from './VillaInspectionForm';
import { ApartmentInspectionForm } from './ApartmentInspectionForm';
import { LandInspectionForm } from './LandInspectionForm';
import { BuildingInspectionForm } from './BuildingInspectionForm';
import { OfficeInspectionForm } from './OfficeInspectionForm';
import { StorageInspectionForm } from './StorageInspectionForm';
import { InspectionFormProps } from './StandardInspectionForm';

export const AllPropertyTypesForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Force scroll to top when the form opens
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scrolling when form closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (selectedType) {
    switch (selectedType) {
      case 'villa':
        return <VillaInspectionForm {...props} />;
      case 'apartment':
        return <ApartmentInspectionForm {...props} />;
      case 'land':
        return <LandInspectionForm {...props} />;
      case 'building':
        return <BuildingInspectionForm {...props} />;
      case 'office':
        return <OfficeInspectionForm {...props} />;
      case 'storage':
        return <StorageInspectionForm {...props} />;
      default:
        return <VillaInspectionForm {...props} />;
    }
  }

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
            <span className="font-medium">مبنى</span>
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
        
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={props.onComplete}
            className="w-full p-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            إلغاء
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};