import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, User, ClipboardList } from 'lucide-react';
import { useMemo } from 'react';

export const EngineerList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineers, setEngineers] = useState<any[]>([]);

  // Memoize engineers data
  const memoizedEngineers = useMemo(() => engineers, [engineers]);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('engineers')
        .select(`
          *,
          profile:profiles!engineers_user_id_fkey(
            id,
            first_name,
            email
          ),
          bookings:bookings(id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEngineers(data || []);
    } catch (error) {
      console.error('Error fetching engineers:', error);
      setError('حدث خطأ في تحميل قائمة المهندسين');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (engineerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('engineers')
        .update({ status: newStatus })
        .eq('id', engineerId);

      if (error) throw error;
      
      await fetchEngineers();
    } catch (error) {
      console.error('Error updating engineer status:', error);
      setError('حدث خطأ في تحديث حالة المهندس');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">المهندسين المعتمدين</h2>
        <div className="p-2 bg-emerald-50 rounded-xl">
          <User className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {engineers.length === 0 ? (
        <p className="text-center text-gray-500 p-4">
          لا يوجد مهندسين معتمدين
        </p>
      ) : (
        <div className="grid gap-4">
          {memoizedEngineers.map((engineer) => (
            <motion.div
              key={engineer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              layout
              layoutId={engineer.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold">{engineer.profile?.first_name}</h3>
                  <p className="text-gray-500">{engineer.profile?.email}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  engineer.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {engineer.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p>رقم الهوية: {engineer.id_number}</p>
                <p>رقم الجوال: {engineer.phone_number}</p>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <ClipboardList className="w-4 h-4" />
                  <span>
                    {engineer.bookings?.length || 0} حجز
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleStatusChange(
                  engineer.id,
                  engineer.status === 'active' ? 'inactive' : 'active'
                )}
                variant={engineer.status === 'active' ? 'secondary' : 'primary'}
                className="w-full"
              >
                {engineer.status === 'active' ? 'إيقاف' : 'تفعيل'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};