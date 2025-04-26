import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const AdminProfile = () => {
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const firstName = (form.firstName as HTMLInputElement).value;

      await updateProfile({ first_name: firstName });
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-2xl font-bold mb-6">الملف الشخصي</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={user?.email}
            disabled
          />

          <Input
            label="الاسم"
            name="firstName"
            type="text"
            defaultValue={user?.first_name}
            required
          />

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>تم تحديث الملف الشخصي بنجاح</span>
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            حفظ التغييرات
          </Button>
        </form>
      </motion.div>
    </div>
  );
};