import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../store/bookingStore';
import { usePackageStore } from '../../store/packageStore';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { DatePicker } from '../booking/DatePicker';
import { TimePicker } from '../booking/TimePicker';
import { AlertCircle, CheckCircle, Package, Building, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BookingForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [packageId, setPackageId] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [district, setDistrict] = useState('');
  
  const { packages } = usePackageStore();
  const { propertyTypes, selectedPackageId, createBooking, fetchPropertyTypes } = useBookingStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  useEffect(() => {
    if (selectedPackageId) {
      setPackageId(selectedPackageId);
    }
  }, [selectedPackageId]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center p-8"
      >
        <h2 className="text-2xl font-bold mb-4">قم بتسجيل الدخول للحجز</h2>
        <p className="text-gray-600 mb-6">
          يجب تسجيل الدخول أولاً لتتمكن من حجز موعد فحص
        </p>
        <Button onClick={() => navigate('/auth')} className="w-full">
          تسجيل الدخول
        </Button>
      </motion.div>
    );
  }

  const validateForm = () => {
    if (!packageId) {
      setError('يرجى اختيار الباقة');
      return false;
    }
    if (!propertyTypeId) {
      setError('يرجى اختيار نوع العقار');
      return false;
    }
    if (!phone) {
      setError('يرجى إدخال رقم الجوال');
      return false;
    }
    if (!district) {
      setError('يرجى إدخال الحي');
      return false;
    }
    if (!date) {
      setError('يرجى اختيار تاريخ الحجز');
      return false;
    }
    if (!time) {
      setError('يرجى اختيار وقت الحجز');
      return false;
    }

    const phoneRegex = /^05[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('رقم الجوال غير صحيح');
      return false;
    }

    return true;
  };

  const selectedPackage = packages.find(p => p.id === packageId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const form = e.target as HTMLFormElement;
      const notes = (form.notes as HTMLTextAreaElement)?.value || '';
      const location = `${district}، الرياض`;

      await createBooking({
        package_id: packageId,
        property_type_id: propertyTypeId,
        phone_number: phone,
        location,
        notes,
        booking_date: date,
        booking_time: time,
      });
      
      setSuccess(true);
      form.reset();
      setDate('');
      setTime('');
      setDistrict('');
      setPhone('');
      setPackageId(selectedPackageId || '');
      setPropertyTypeId('');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في إنشاء الحجز');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = packageId && propertyTypeId && phone && district && date && time && !loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {selectedPackage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-emerald-50 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold">{selectedPackage.name}</h3>
              <p className="text-sm text-emerald-600">
                {selectedPackage.price} ريال
              </p>
            </div>
          </div>
          <p className="text-sm text-emerald-700">
            {selectedPackage.description}
          </p>
        </motion.div>
      )}

      <h2 className="text-2xl font-bold mb-6">احجز موعد فحص</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الباقة
              {!selectedPackageId && (
                <span className="text-xs text-gray-500"> - يمكنك اختيار باقة من صفحة الباقات</span>
              )}
            </label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">اختر الباقة</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {pkg.price} ريال
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <Building className="w-4 h-4" />
            <span>اختر نوع العقار المراد فحصه</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العقار
            </label>
            <select
              value={propertyTypeId}
              onChange={(e) => setPropertyTypeId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">اختر نوع العقار</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>حدد موقع العقار</span>
        </div>
        <Input
          label="الحي"
          type="text"
          placeholder="مثال: النرجس، العليا، الملز"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>اختر موعد الفحص المناسب</span>
        </div>
        <Input
          label="رقم الجوال"
          type="tel"
          pattern="^05[0-9]{8}$"
          placeholder="05xxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>حدد تاريخ ووقت الفحص</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DatePicker value={date} onChange={setDate} />
          <TimePicker value={time} onChange={setTime} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات إضافية
          </label>
          <textarea
            name="notes"
            rows={3}
            className="input-field"
            placeholder="أي معلومات إضافية تود إضافتها..."
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>تم تسجيل الحجز بنجاح</span>
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={!isFormValid || loading}
        >
          تأكيد الحجز
        </Button>
      </form>

      {loading && <LoadingSpinner />}
    </motion.div>
  );
};