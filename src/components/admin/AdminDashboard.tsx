import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, X, UserPlus, FileText, Clock, Users, ClipboardList } from 'lucide-react';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineerRequests, setEngineerRequests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch engineer requests
      const { data: requests, error: requestsError } = await supabase
        .from('engineer_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch recent bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          engineer:engineers(
            id,
            user_id,
            profiles:user_id(
              first_name
            )
          ),
          property_type:property_types(
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (bookingsError) throw bookingsError;

      setEngineerRequests(requests || []);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEngineer = async (requestId: string) => {
    try {
      const { error } = await supabase.functions.invoke('engineer-approval', {
        body: { requestId }
      });

      if (error) throw error;
      
      await fetchData();
    } catch (error) {
      console.error('Error approving engineer:', error);
      setError('حدث خطأ في قبول طلب المهندس');
    }
  };

  const handleRejectEngineer = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('engineer_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      await fetchData();
    } catch (error) {
      console.error('Error rejecting engineer:', error);
      setError('حدث خطأ في رفض طلب المهندس');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
            onClick={() => navigate('/admin/bookings')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <ClipboardList className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold">إدارة الحجوزات</h3>
            </div>
            <p className="text-gray-600 text-sm">إدارة طلبات الفحص وتعيين المهندسين</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
            onClick={() => navigate('/admin/engineers')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold">المهندسين</h3>
            </div>
            <p className="text-gray-600 text-sm">إدارة المهندسين وطلبات التسجيل</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
            onClick={() => navigate('/admin/reports')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold">التقارير</h3>
            </div>
            <p className="text-gray-600 text-sm">عرض وإدارة تقارير الفحص</p>
          </motion.div>
        </div>
        {/* Engineer Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">طلبات المهندسين</h2>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {engineerRequests.length === 0 ? (
            <p className="text-gray-500 text-center p-4">
              لا توجد طلبات جديدة
            </p>
          ) : (
            <div className="space-y-4">
              {engineerRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{request.email}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>رقم الهوية: {request.id_number}</p>
                    <p>رقم الجوال: {request.phone_number}</p>
                    {request.message && (
                      <p className="mt-2">{request.message}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveEngineer(request.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>قبول</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleRejectEngineer(request.id)}
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
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">آخر الحجوزات</h2>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center p-4">
              لا توجد حجوزات
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      {booking.property_type?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : booking.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status === 'completed'
                        ? 'مكتمل'
                        : booking.status === 'in_progress'
                        ? 'جاري الفحص'
                        : 'قيد المراجعة'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p>الموقع: {booking.location}</p>
                    <p>
                      التاريخ: {new Date(booking.booking_date).toLocaleDateString('ar-SA')}
                    </p>
                    <p>الوقت: {booking.booking_time}</p>
                    {booking.engineer?.profiles?.first_name && (
                      <p>المهندس: {booking.engineer.profiles.first_name}</p>
                    )}
                  </div>

                  {booking.status === 'completed' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {/* TODO: View report */}}
                    >
                      <FileText className="w-4 h-4" />
                      <span>عرض التقرير</span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};