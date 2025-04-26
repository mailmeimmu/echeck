import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  onChange: (time: string) => void;
  value?: string;
}

export const TimePicker = ({ onChange, value }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        الوقت
      </label>
      
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-right shadow-sm"
      >
        <span className="text-gray-600">
          {value ? formatTime(value) : 'اختر الوقت'}
        </span>
        <Clock className="w-5 h-5 text-gray-400" />
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
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <motion.button
                    key={time}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(time)}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      value === time
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {formatTime(time)}
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