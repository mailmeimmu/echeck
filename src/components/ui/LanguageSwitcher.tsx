import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../utils/i18n';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="fixed bottom-24 left-4 z-50 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-emerald-600 hover:bg-emerald-50 transition-colors"
      aria-label="Toggle Language"
    >
      <div className="relative">
        <Languages className="w-6 h-6" />
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="absolute -top-1 -right-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full px-1.5 py-0.5"
        >
          {language.toUpperCase()}
        </motion.div>
      </div>
    </motion.button>
  );
};