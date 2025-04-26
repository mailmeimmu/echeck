import { motion } from 'framer-motion';
import { Package, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const Hero = () => (
  <div className="min-h-[calc(100vh-80px)] flex items-center relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
    {/* Animated background elements */}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 45, 0],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{ duration: 10, repeat: Infinity }}
      className="absolute top-20 right-20 w-64 h-64 rounded-full bg-emerald-200/20"
    />
    <motion.div
      animate={{ 
        scale: [1, 1.3, 1],
        rotate: [0, -45, 0],
        opacity: [0.1, 0.15, 0.1]
      }}
      transition={{ duration: 15, repeat: Infinity }}
      className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-emerald-300/20"
    />

    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Package className="w-20 h-20 text-emerald-600" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800">
            أضمن عقارك قبل لا تاخذ خطوة، فحص دقيق يريح بالك.
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            نقدم خدمات فحص شاملة للعقارات بأحدث التقنيات وأفضل المهندسين المتخصصين
          </p>

          <Button 
            size="lg" 
            className="group"
            onClick={() => window.open('https://rekaz.io', '_blank')}
          >
            <Button size="lg" className="group">
              <span>استكشف باقاتنا</span>
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {[
            'فحص شامل للعقار',
            'مهندسين معتمدين',
            'تقارير مفصلة',
            'ضمان الجودة',
            'دعم متواصل'
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm"
            >
              <div className="p-2 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-lg">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </div>
);