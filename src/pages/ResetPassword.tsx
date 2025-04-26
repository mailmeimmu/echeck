import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    if (!accessToken) {
      setMessage('Invalid or expired reset link.');
    }
  }, [searchParams]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
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