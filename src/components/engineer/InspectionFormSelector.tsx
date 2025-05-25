import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import InspectionForm from './InspectionForm';
import { withRetry } from '../../utils/databaseHelpers';

interface InspectionFormSelectorProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionFormSelector = ({ bookingId, onComplete = () => {} }: InspectionFormSelectorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force scroll to top when the form opens
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    // Verify database connection before showing form
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        await withRetry(async () => {
          const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('id', bookingId)
            .single();
            
          if (error) throw error;
          return data;
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Connection error:', err);
        setError('حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    return () => {
      // Re-enable body scrolling when form closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium">جاري التحقق من الاتصال...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-lg font-medium mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              إلغاء
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return <InspectionForm bookingId={bookingId} onComplete={onComplete} />;
}
