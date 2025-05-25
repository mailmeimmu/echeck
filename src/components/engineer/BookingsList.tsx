import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button'; 
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Calendar, Clock, Package, Building, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, ListChecks, ClipboardList, FileText } from 'lucide-react';
import { InspectionForm } from './InspectionForm';

interface EngineerLayoutContext {
  setShowInspectionForm: (show: boolean) => void;
}

interface BookingCategory {
  title: string;
  icon: typeof Package;
  bookings: Booking[];
  emptyMessage: string;
}

interface Booking {
  id: string;
  status: string;
  location: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
  package: {
    name: string;
    price: number;
  };
  property_type: {
    name: string;
  };
  engineer_id?: string;
}

interface RejectionReason {
  id: string;
  name: string;
  description?: string;
}

export const BookingsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showInspectionForm, setShowInspectionForm] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);
  const { setShowInspectionForm: setLayoutShowInspectionForm } = useOutletContext<EngineerLayoutContext>();
  const [engineerId, setEngineerId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  // Notify the layout when inspection form opens or closes
  useEffect(() => {
    setLayoutShowInspectionForm(!!showInspectionForm);
    
    // Dispatch custom events for other components to listen to
    if (showInspectionForm) {
      window.dispatchEvent(new CustomEvent('inspection-form-open'));
    } else {
      window.dispatchEvent(new CustomEvent('inspection-form-close'));
    }
  }, [showInspectionForm, setLayoutShowInspectionForm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user's session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error('حدث خطأ في التحقق من الهوية');
      }
      
      if (!user) {
        setError('يرجى تسجيل الدخول للوصول إلى هذه الصفحة');
        setLoading(false);
        return;
      }

      // Get the engineer data
      const { data: engineerData, error: engineerError } = await supabase
        .from('engineers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (engineerError) {
        if (engineerError.code === 'PGRST116') {
          setError('لم يتم العثور على حساب مهندس مرتبط بهذا المستخدم');
        } else {
          throw engineerError;
        }
        setLoading(false);
        return;
      }

      if (!engineerData) {
        setError('لم يتم العثور على حساب مهندس مرتبط بهذا المستخدم');
        setLoading(false);
        return;
      }

      setEngineerId(engineerData.id);

      // Fetch bookings:
      // - status = 'pending' and engineer_id is null (available to accept)
      // - OR assigned to this engineer and status in (engineer_assigned, in_progress, completed)
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          location,
          booking_date,
          booking_time,
          notes,
          engineer_id,
          package:packages(name, price),
          property_type:property_types(name)
        `)
        .or(
          `and(status.eq.pending,engineer_id.is.null),` +
          `and(engineer_id.eq.${engineerData.id},status.in.(engineer_assigned,in_progress,completed))`
        )
        .order('booking_date', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);

      // Fetch rejection reasons
      const { data: reasonsData, error: reasonsError } = await supabase
        .from('rejection_reasons')
        .select('*')
        .order('name');

      if (reasonsError) throw reasonsError;

      setRejectionReasons(reasonsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    if (processingBooking) return;

    try {
      setError(null);
      setProcessingBooking(bookingId);

      // Get current user and engineer
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: engineerData } = await supabase
        .from('engineers')
        .select('id, status')
        .eq('user_id', user.id)
        .single();
      if (!engineerData) throw new Error('Engineer not found');
      if (engineerData.status !== 'active') throw new Error('يجب أن يكون حسابك مفعل لقبول الطلبات');

      // Check booking is still pending and unassigned
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('status, engineer_id')
        .eq('id', bookingId)
        .single();
      if (bookingError) throw bookingError;
      if (!booking || booking.status !== 'pending' || booking.engineer_id) {
        await fetchBookings();
        throw new Error('هذا الطلب لم يعد متاحاً. تم تحديث القائمة.');
      }

      // Lock: check for existing engineer response
      const { data: existingResponses, error: responseCheckError } = await supabase
        .from('engineer_responses')
        .select('status')
        .eq('booking_id', bookingId);
      if (responseCheckError) throw responseCheckError;
      if (existingResponses && existingResponses.length > 0) {
        await fetchBookings();
        throw new Error('تم حجز هذا الطلب من قبل مهندس آخر. تم تحديث القائمة.');
      }

      // Create engineer response
      const { error: responseError } = await supabase
        .from('engineer_responses')
        .insert({
          booking_id: bookingId,
          engineer_id: engineerData.id,
          status: 'accepted'
        });
      if (responseError) {
        if (responseError.message.includes('duplicate key value')) {
          await fetchBookings();
          throw new Error('تم حجز هذا الطلب من قبل مهندس آخر. تم تحديث القائمة.');
        }
        throw responseError;
      }

      // Update booking status to 'open' (for admin review)
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'open'
        })
        .eq('id', bookingId)
        .eq('status', 'pending')
        .is('engineer_id', null);
      if (updateError) {
        await fetchBookings();
        throw new Error('حدث خطأ أثناء تحديث حالة الطلب.');
      }

      await fetchBookings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ في قبول الطلب');
      console.error('Error accepting booking:', error);
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !selectedReason) return;

    try {
      setError(null);
      setLoading(true);

      // Check if the booking is still available before rejecting
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', selectedBooking)
        .single();

      if (bookingError) throw bookingError;

      if (!booking || booking.status !== 'pending') {
        await fetchBookings();
        throw new Error('هذا الطلب لم يعد متاحاً. تم تحديث القائمة.');
      }

      // Get the current user's engineer ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: engineerData } = await supabase
        .from('engineers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!engineerData) throw new Error('Engineer not found');

      const { data, error } = await supabase.rpc('handle_engineer_response', {
        p_booking_id: selectedBooking,
        p_status: 'rejected',
        p_rejection_reason_id: selectedReason,
        p_notes: rejectionNotes
      });

      if (error) throw error;

      await fetchBookings();
      setShowRejectModal(false);
      setSelectedBooking(null);
      setSelectedReason('');
      setRejectionNotes('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ في رفض الطلب');
      console.error('Error rejecting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async (bookingId: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.rpc('start_inspection', {
        p_booking_id: bookingId
      });

      if (error) throw error;

      await fetchBookings();
    } catch (error) {
      setError('حدث خطأ في بدء الفحص');
      console.error('Error starting inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group bookings by category
  const categories: BookingCategory[] = [
    {
      title: 'الطلبات المتاحة',
      icon: ClipboardList,
      bookings: bookings.filter(b => b.status === 'pending' && !b.engineer_id),
      emptyMessage: 'لا توجد طلبات متاحة'
    },
    {
      title: 'طلباتي',
      icon: ListChecks,
      bookings: bookings.filter(
        b =>
          b.engineer_id === engineerId &&
          ['engineer_assigned', 'in_progress', 'completed'].includes(b.status)
      ),
      emptyMessage: 'لا توجد طلبات مقبولة'
    }
  ];

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-red-50 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
        <Button 
          onClick={() => {
            setError(null);
            fetchBookings();
          }}
          variant="outline"
          className="mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>إعادة المحاولة</span>
        </Button>
      </motion.div>
    );
  }

  if (!bookings.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 bg-gray-50 rounded-2xl"
      >
        <p className="text-gray-600">لا توجد طلبات فحص حالياً</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <category.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold">{category.title}</h2>
            </div>

            {category.bookings.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-2xl">
                <p className="text-gray-600">{category.emptyMessage}</p>
              </div>
            ) : (
              <AnimatePresence>
                {category.bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                          <Package className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-lg block">
                            {booking.package.name}
                          </span>
                          <span className="text-emerald-600">
                            {booking.package.price} ريال
                          </span>
                        </div>
                      </div>
                      
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        booking.status === 'pending' 
                          ? 'bg-amber-50 text-amber-700'
                          : booking.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700'
                          : booking.status === 'engineer_assigned'
                          ? 'bg-blue-50 text-blue-700'
                          : booking.status === 'in_progress'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {booking.status === 'pending' ? 'قيد المراجعة'
                          : booking.status === 'open' ? 'بانتظار موافقة الإدارة'
                          : booking.status === 'engineer_assigned' ? 'تم القبول'
                          : booking.status === 'in_progress' ? 'جاري الفحص'
                          : 'مكتمل'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <Building className="w-5 h-5" />
                        </div>
                        <span>{booking.property_type.name}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span>{booking.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.booking_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.booking_time}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                        {booking.notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {booking.status === 'pending' && !booking.engineer_id && (
                        <>
                          <Button
                            onClick={() => handleAccept(booking.id)}
                            className="flex-1"
                            disabled={processingBooking === booking.id}
                          >
                            {processingBooking === booking.id ? (
                              <LoadingSpinner className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                            <span>قبول الطلب</span>
                          </Button>

                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              setShowRejectModal(true);
                            }}
                            disabled={processingBooking === booking.id}
                          >
                            <XCircle className="w-5 h-5" />
                            <span>رفض الطلب</span>
                          </Button>
                        </>
                      )}

                      {booking.status === 'engineer_assigned' && booking.engineer_id === engineerId && (
                        <Button
                          onClick={() => handleStartInspection(booking.id)}
                          className="w-full"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>بدء الفحص</span>
                        </Button>
                      )}

                      {booking.status === 'in_progress' && booking.engineer_id === engineerId && (
                        <Button
                          onClick={() => {
                            setShowInspectionForm(booking.id);
                          }}
                          className="w-full"
                        >
                          <FileText className="w-5 h-5" />
                          <span>إضافة تقرير الفحص</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showInspectionForm && (
          <InspectionForm 
            bookingId={showInspectionForm}
            onComplete={() => {
              // Close the inspection form
              setShowInspectionForm(null);
              // Refresh bookings list
              fetchBookings();
            }}
          />
        )}

        {showRejectModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">رفض الطلب</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سبب الرفض
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">اختر السبب</option>
                    {rejectionReasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    className="flex-1"
                    disabled={!selectedReason}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>تأكيد الرفض</span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedBooking(null);
                      setSelectedReason('');
                      setRejectionNotes('');
                    }}
                  >
                    <span>إلغاء</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};