import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  onChange: (date: string) => void;
  value?: string;
}

export const DatePicker = ({ onChange, value }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSelect = (date: Date) => {
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        التاريخ
      </label>
      
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-right shadow-sm"
      >
        <span className="text-gray-600">
          {value ? formatDate(new Date(value)) : 'اختر التاريخ'}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 bg-white rounded-2xl shadow-lg p-4 z-50 border border-gray-100 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-2">
                {dates.map((date) => (
                  <motion.button
                    key={date.toISOString()}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(date)}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      value === date.toISOString().split('T')[0]
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold">
                      {date.toLocaleDateString('ar-SA', { weekday: 'long' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {date.toLocaleDateString('ar-SA', { 
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};