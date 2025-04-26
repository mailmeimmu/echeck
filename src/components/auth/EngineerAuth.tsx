import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEngineerStore } from '../../store/engineerStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { HardHat, AlertCircle, CheckCircle } from 'lucide-react';

interface EngineerAuthProps {
  onBack: () => void;
}

export const EngineerAuth = ({ onBack }: EngineerAuthProps) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loading, requestAccess } = useEngineerStore();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    
    try {
      await requestAccess({
        id_number: form.id_number.value,
        phone_number: form.phone_number.value,
        email: form.email.value,
        message: form.message.value,
      });
      
      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error('Request error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في إرسال الطلب');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
            className="inline-block p-3 bg-emerald-100 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </motion.div>
        
          <h2 className="text-2xl font-bold mb-4">تم استلام طلبك بنجاح</h2>
          <p className="text-gray-600 mb-6">
            سيتم مراجعة طلبك والتواصل معك على البريد الإلكتروني المسجل
          </p>
        
          <Button onClick={onBack} variant="outline" className="w-full">
            العودة للصفحة الرئيسية
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block p-4 bg-emerald-50 rounded-full mb-4"
          >
            <HardHat className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">طلب تسجيل مهندس</h2>
          <p className="text-gray-600">
            قم بتعبئة النموذج التالي لطلب الانضمام كمهندس معتمد
          </p>
        </div>

        <form onSubmit={handleRequest} className="space-y-4">
          <Input
            label="رقم الهوية"
            name="id_number"
            type="text"
            required
          />
        
          <Input
            label="رقم الجوال"
            name="phone_number"
            type="tel"
            pattern="^05[0-9]{8}$"
            placeholder="05xxxxxxxx"
            required
          />

          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            required
          />
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة الطلب
            </label>
            <textarea
              name="message"
              rows={4}
              className="input-field"
              placeholder="اكتب رسالة توضح فيها خبرتك ومجال عملك..."
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              إرسال الطلب
            </Button>
          
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onBack}
              disabled={loading}
            >
              رجوع
            </Button>
          </div>
        </form>

        {loading && <LoadingSpinner />}
      </motion.div>
    </div>
  );
};