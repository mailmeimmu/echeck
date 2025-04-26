import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthForm } from '../components/auth/AuthForm';
import { EngineerAuth } from '../components/auth/EngineerAuth';
import { Package, HardHat } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AuthPage = () => {
  const [mode, setMode] = useState<'select' | 'user' | 'engineer'>('select');

  return (
    <div className="page-container flex flex-col items-center justify-center p-6 pt-24">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <Package className="w-16 h-16 text-emerald-600" />
            </motion.div>

            <h1 className="text-4xl font-bold text-emerald-600 mb-2">شيك</h1>
            <p className="text-gray-600 mb-8">منصة فحص العقارات الأولى في المملكة</p>

            <div className="space-y-4">
              <Button
                onClick={() => setMode('user')}
                className="w-full"
              >
                <Package className="w-5 h-5" />
                <span>تسجيل الدخول</span>
              </Button>

              <Button
                onClick={() => setMode('engineer')}
                variant="outline"
                className="w-full"
              >
                <HardHat className="w-5 h-5" />
                <span>تسجيل كمهندس</span>
              </Button>
            </div>
          </motion.div>
        )}

        {mode === 'user' && (
          <motion.div
            key="user"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full pt-12"
          >
            <AuthForm onBack={() => setMode('select')} />
          </motion.div>
        )}

        {mode === 'engineer' && (
          <motion.div
            key="engineer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <EngineerAuth onBack={() => setMode('select')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};