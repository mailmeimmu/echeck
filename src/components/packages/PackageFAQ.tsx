import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'كم تستغرق عملية الفحص؟',
    answer: 'تستغرق عملية الفحص من 2-4 ساعات حسب حجم العقار ونوع الباقة المختارة.'
  },
  {
    question: 'هل يمكنني تغيير موعد الفحص؟',
    answer: 'نعم، يمكنك تغيير الموعد قبل 24 ساعة من الموعد المحدد.'
  },
  {
    question: 'متى أستلم تقرير الفحص؟',
    answer: 'يتم تسليم التقرير خلال 24 ساعة من انتهاء عملية الفحص.'
  },
  {
    question: 'هل المهندسين معتمدين؟',
    answer: 'نعم، جميع مهندسينا معتمدين ولديهم خبرة لا تقل عن 5 سنوات.'
  }
];

export const PackageFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">الأسئلة الشائعة</h2>
        <p className="text-gray-600">إجابات على أكثر الأسئلة شيوعاً حول خدمة الفحص</p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-right flex items-center justify-between"
            >
              <span className="font-semibold">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};