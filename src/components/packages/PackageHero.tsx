import { motion } from 'framer-motion';
import { Package, CheckCircle } from 'lucide-react';

export const PackageHero = () => (
  <div className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block p-4 bg-emerald-50 rounded-full mb-6"
      >
        <Package className="w-12 h-12 text-emerald-600" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800">
        اختر الباقة المناسبة لعقارك
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        باقات متنوعة تلبي احتياجاتك مع خدمة فحص شاملة من مهندسين معتمدين
      </p>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {[
          'ضمان الجودة',
          'مهندسين معتمدين',
          'تقارير شاملة',
          'دعم متواصل'
        ].map((feature) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{feature}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);