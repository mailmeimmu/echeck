import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, X, UserPlus } from 'lucide-react';

const EngineerRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('engineer_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('حدث خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('engineer-approval', {
        body: { requestId }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'حدث خطأ في قبول الطلب');
      }

      if (!data?.success) {
        throw new Error(data?.message || 'حدث خطأ في قبول الطلب');
      }
      
      await fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في قبول الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the request details first
      const { data: request, error: fetchError } = await supabase
        .from('engineer_requests')
        .select('email')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error } = await supabase
        .from('engineer_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Send rejection email
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'ENGINEER_REJECTED',
          data: {
            email: request.email,
            reason: 'لم يتم استيفاء متطلبات التسجيل'
          }
        }
      });
      
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('حدث خطأ في رفض الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">طلبات التسجيل</h2>
        <div className="p-2 bg-emerald-50 rounded-xl">
          <UserPlus className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 p-4">
          لا توجد طلبات جديدة
        </p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold">{request.email}</h3>
                  <p className="text-gray-500">
                    {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p>رقم الهوية: {request.id_number}</p>
                <p>رقم الجوال: {request.phone_number}</p>
                {request.message && (
                  <p className="text-gray-600 mt-2">{request.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>قبول</span>
                </Button>

                <Button
                  onClick={() => handleReject(request.id)}
                  variant="secondary"
                  className="flex-1"
                >
                  <X className="w-4 h-4" />
                  <span>رفض</span>
                </Button>
              </div>
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

export default EngineerRequests;