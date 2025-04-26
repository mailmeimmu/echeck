import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProfileForm = () => {
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const firstName = (form.firstName as HTMLInputElement).value;

    try {
      await updateProfile({ first_name: firstName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-2xl font-bold mb-6">الملف الشخصي</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الاسم الأول"
          name="firstName"
          type="text"
          defaultValue={user?.first_name || ''}
          required
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          value={user?.email}
          disabled
        />

        <Button type="submit" className="w-full">
          حفظ التغييرات
        </Button>
      </form>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-100 text-green-700 p-3 rounded-lg mt-4"
        >
          تم حفظ التغييرات بنجاح
        </motion.div>
      )}

      {loading && <LoadingSpinner />}
    </motion.div>
  );
};