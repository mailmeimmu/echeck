import { motion } from 'framer-motion';
import { Shield, Clock, Award, Users } from 'lucide-react';

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
  }
];

export const Features = () => (
  <div className="py-24 bg-white">
    <div className="max-w-5xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center mb-16"
      >
        لماذا تختار شيك؟
      </motion.h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-4">
              <feature.icon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);