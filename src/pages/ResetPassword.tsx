import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [type, setType] = useState<'verify' | 'update'>('verify');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      navigate('/auth', { replace: true });
      return;
    }
    
    // Verify the code first
    const verifyCode = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery'
        });

        if (error) {
          throw error;
        }

        setType('update');
      } catch (error) {
        console.error('Code verification error:', error);
        navigate('/auth', { replace: true });
      }
    };

    verifyCode();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (password !== confirmPassword) {
        throw new Error('كلمات المرور غير متطابقة');
      }

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-50 rounded-full">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">جاري التحقق من الرمز</h2>
            <LoadingSpinner />
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-50 rounded-full">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">
            تعيين كلمة المرور الجديدة
          </h2>

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-4">
                <CheckCircle className="w-6 h-6" />
                <span>تم تحديث كلمة المرور بنجاح</span>
              </div>
              <p className="text-gray-600">
                جاري تحويلك لصفحة تسجيل الدخول...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="كلمة المرور الجديدة"
                name="password"
                type="password"
                required
                minLength={6}
              />
              
              <Input
                label="تأكيد كلمة المرور"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
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

              <Button type="submit" className="w-full" disabled={loading}>
                تحديث كلمة المرور
              </Button>
            </form>
          )}
        </div>
      </motion.div>

      {loading && <LoadingSpinner />}
    </div>
  );
};