import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import { AllPropertyTypesForm } from './forms/AllPropertyTypesForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { withRetry } from '../../utils/databaseHelpers';
import { supabase } from '../../lib/supabase';

interface InspectionFormSelectorProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionFormSelector = ({ bookingId, onComplete = () => {} }: InspectionFormSelectorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    // Verify database connection with improved error handling
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // Use withRetry with increased max retries
        await withRetry(
          async () => {
            const { data, error } = await supabase
              .from('bookings')
              .select('id')
              .eq('id', bookingId)
              .single();
              
            if (error) throw error;
            return data;
          },
          5 // Increase max retries to 5
        );
        
        // Only set loading to false if we haven't encountered an error
        if (!error) {
          setIsLoading(false);
        }
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
      
      // Clean up any pending network requests
      const controller = new AbortController();
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto"
        onClick={onComplete}
      >
        <div 
          className="bg-white rounded-2xl p-8 max-w-md w-[95%] text-center my-8 mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-red-500 text-xl mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-lg font-medium mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Clear cache and retry
                clearSupabaseCache();
                checkConnection();
              }}
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

  return <AllPropertyTypesForm bookingId={bookingId} onComplete={onComplete} />;
}