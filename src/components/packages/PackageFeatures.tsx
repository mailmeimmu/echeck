import { motion } from 'framer-motion';
import { Shield, Clock, Award, Users, FileCheck, Wrench } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'فحص شامل',
    description: 'فحص دقيق لجميع جوانب العقار باستخدام أحدث التقنيات'
  },
  {
    icon: Clock,
    title: 'سرعة التنفيذ',
    description: 'نضمن إتمام الفحص وتسليم التقرير خلال 24 ساعة'
  },
  {
    icon: Award,
    title: 'خبرة عالية',
    description: 'فريق من المهندسين المعتمدين ذوي الخبرة العالية'
  },
  {
    icon: Users,
    title: 'دعم متواصل',
    description: 'فريق دعم متخصص لخدمتك على مدار الساعة'
  },
  {
    icon: FileCheck,
    title: 'تقارير مفصلة',
    description: 'تقارير شاملة ودقيقة مع التوصيات والملاحظات'
  },
  {
    icon: Wrench,
    title: 'معدات متطورة',
    description: 'استخدام أحدث المعدات والأجهزة في عمليات الفحص'
  }
];

export const PackageFeatures = () => (
  <div className="py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl font-bold mb-4">مميزات خدمة الفحص</h2>
      <p className="text-gray-600">نقدم خدمة فحص شاملة ومتكاملة تضمن لك جودة عقارك</p>
    </motion.div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4">
            <feature.icon className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
);