import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { getEngineerDetails } from '../utils/engineer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useOutletContext } from 'react-router-dom';

interface EngineerDetails {
  id: string;
  id_number: string;
  phone_number: string;
  status: string;
  profiles: {
    email: string;
    first_name: string;
  };
}

interface EngineerLayoutContext {
  setShowInspectionForm: (show: boolean) => void;
}

export const EngineerProfile = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<EngineerDetails | null>(null);
  const { setShowInspectionForm } = useOutletContext<EngineerLayoutContext>();

  useEffect(() => {
    const fetchDetails = async () => {
      if (user) {
        const data = await getEngineerDetails(user.id);
        setDetails(data);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  if (!details) {
    return (
      <div className="p-6 text-center text-gray-600">
        لم يتم العثور على بيانات المهندس
      </div>
    );
  }

  return (
    <div className="p-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-bold mb-6">الملف الشخصي</h2>

        <div className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={details.profiles.email}
            disabled
          />

          <Input
            label="الاسم"
            type="text"
            value={details.profiles.first_name}
            disabled
          />

          <Input
            label="رقم الهوية"
            type="text"
            value={details.id_number}
            disabled
          />

          <Input
            label="رقم الجوال"
            type="tel"
            value={details.phone_number}
            disabled
          />

          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="font-semibold text-emerald-700">الحالة: {details.status === 'active' ? 'نشط' : 'غير نشط'}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};