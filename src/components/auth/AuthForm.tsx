import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { Input } from '../ui/Input'; 
import { Button } from '../ui/Button'; 
import { LoadingSpinner } from '../ui/LoadingSpinner'; 
import { useAuthStore } from '../../store/authStore'; 
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const { signIn, resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.email as HTMLInputElement).value;

    try {
      if (isResetMode) {
        // Send reset password email
        await resetPassword(email);
        setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        // Optionally, keep in reset mode or return to login
        // setIsResetMode(false);
      } else {
        const password = (form.password as HTMLInputElement).value;
        const { isEngineer, isAdmin } = await signIn(email, password);

        if (isEngineer) {
          navigate('/engineer', { replace: true });
        } else if (isAdmin) {
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-md w-full mx-auto p-8"
    >
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-emerald-50 rounded-full">
          <Lock className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isResetMode ? 'إعادة تعيين كلمة المرور' : 'تسجيل الدخول للنظام'}
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-4"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-50 text-emerald-600 p-3 rounded-lg flex items-center gap-2 mb-4"
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          name="email"
          type="email"
          required
          placeholder="example@check.sa"
          autoComplete="username"
        />
        
        {!isResetMode && (
          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
          />
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {isResetMode ? 'إرسال رابط إعادة التعيين' : 'دخول'}
        </Button>

        <button
          type="button"
          onClick={() => {
            setIsResetMode(!isResetMode);
            setError('');
            setSuccess('');
          }}
          className="w-full text-sm text-emerald-600 hover:text-emerald-700 text-center mt-2"
        >
          {isResetMode ? 'العودة لتسجيل الدخول' : 'نسيت كلمة المرور؟'}
        </button>
      </form>

      {loading && <LoadingSpinner />}
    </motion.div>
  );
};