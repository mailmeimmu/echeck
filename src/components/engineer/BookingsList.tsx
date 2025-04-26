import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Calendar, Clock, Package, Building, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { InspectionForm } from './InspectionForm';

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
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    console.log('BookingsList mounted');
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Get the current user's engineer ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Fetching bookings for user:', user.id);

      const { data: engineerData } = await supabase
        .from('engineers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!engineerData) {
        console.error('Engineer data not found for user:', user.id);
        throw new Error('Engineer not found');
      }

      console.log('Engineer data:', engineerData);

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
          property_type:property_types(name),
        `)
        .or(`
          status.in.(pending,open),
          and(
            engineer_id.eq.${engineerData.id},
            status.in.(engineer_assigned,in_progress,completed)
          )
        `)
        .order('booking_date', { ascending: false });

      if (fetchError) {
        console.error('Error fetching bookings:', fetchError);
        throw fetchError;
      }

      console.log('Fetched bookings:', data);

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
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.rpc('handle_engineer_response', {
        p_booking_id: bookingId,
        p_status: 'accepted'
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error('Failed to accept booking');
      }

      await fetchBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في قبول الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !selectedReason) return;

    try {
      setError(null);
      setLoading(true);

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
      console.error('Error rejecting booking:', error);
      setError('حدث خطأ في رفض الطلب');
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
      console.error('Error starting inspection:', error);
      setError('حدث خطأ في بدء الفحص');
    } finally {
      setLoading(false);
    }
  };

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {bookings.map((booking) => (
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
                    : booking.status === 'open' ? 'متاح للحجز'
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
                {(booking.status === 'pending' || booking.status === 'open') && (
                  <>
                    <Button
                      onClick={() => handleAccept(booking.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>قبول الطلب</span>
                    </Button>

                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setSelectedBooking(booking.id);
                        setShowRejectModal(true);
                      }}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>رفض الطلب</span>
                    </Button>
                  </>
                )}

                {booking.status === 'engineer_assigned' && (
                  <Button
                    onClick={() => handleStartInspection(booking.id)}
                    className="w-full"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>بدء الفحص</span>
                  </Button>
                )}

                {booking.status === 'in_progress' && (
                  <Button
                    onClick={() => {
                      setSelectedBooking(booking.id);
                      setShowInspectionForm(true);
                    }}
                    className="w-full"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>إضافة تقرير الفحص</span>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showInspectionForm && selectedBooking && (
          <InspectionForm
            bookingId={selectedBooking}
            onComplete={() => {
              setShowInspectionForm(false);
              setSelectedBooking(null);
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