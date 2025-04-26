import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, Package } from 'lucide-react';
import { DatePicker } from '../booking/DatePicker';
import { TimePicker } from '../booking/TimePicker';
import { supabase } from '../../lib/supabase';

interface PackageType {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface PropertyType {
  id: string;
  name: string;
}

export const BookingForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch packages
        const { data: packagesData, error: packagesError } = await supabase
          .from('packages')
          .select('*')
          .order('price', { ascending: false });

        if (packagesError) throw packagesError;

        // Fetch property types
        const { data: propertyTypesData, error: propertyTypesError } = await supabase
          .from('property_types')
          .select('*')
          .order('name');

        if (propertyTypesError) throw propertyTypesError;

        setPackages(packagesData || []);
        setPropertyTypes(propertyTypesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('حدث خطأ في تحميل البيانات');
      }
    };

    fetchData();
  }, []);

  const isValidSaudiPhone = (phone: string) => /^05\d{8}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isValidSaudiPhone(phoneNumber)) {
        setError("رقم الجوال يجب أن يكون بالصيغة السعودية (05xxxxxxxx)");
        setLoading(false);
        return;
      }

      const form = e.target as HTMLFormElement;
      const data = {
        external_booking_id: (form.external_booking_id as HTMLInputElement)?.value || '',
        property_type_id: selectedPropertyType,
        booking_date: bookingDate,
        booking_time: bookingTime,
        location: (form.location as HTMLInputElement)?.value || '',
        notes: (form.notes as HTMLTextAreaElement)?.value || '',
        admin_notes: (form.admin_notes as HTMLTextAreaElement)?.value || '',
        phone_number: phoneNumber,
        package_id: selectedPackage
      };

      // Call the Edge Function
      const response = await fetch(
        'https://usfejbweconajsyemobr.supabase.co/functions/v1/create_admin_booking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'حدث خطأ في إنشاء الحجز');
        setLoading(false);
        return;
      }

      // Reset form
      setSuccess(true);
      setSelectedPackage('');
      setSelectedPropertyType('');
      setBookingDate('');
      setBookingTime('');
      setPhoneNumber('');
      form.reset();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في إنشاء الحجز');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">إنشاء حجز جديد</h2>

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
              <h3 className="font-bold">
                {packages.find(p => p.id === selectedPackage)?.name}
              </h3>
              <p className="text-sm text-emerald-600">
                {packages.find(p => p.id === selectedPackage)?.price} ريال
              </p>
            </div>
          </div>
          <p className="text-sm text-emerald-700">
            {packages.find(p => p.id === selectedPackage)?.description}
          </p>
        </motion.div>
      )}

      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
        <Package className="w-4 h-4" />
        <span>اختر الباقة المناسبة للحجز</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الباقة
          </label>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع العقار
          </label>
          <select
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value)}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="رقم الحجز الخارجي"
          name="external_booking_id"
          type="text"
          required
        />

        <Input
          label="الموقع"
          name="location"
          type="text"
          required
        />

        {/* Phone number input */}
        <Input
          label="رقم جوال العميل"
          name="phone_number"
          type="text"
          required
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="05xxxxxxxx"
        />

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <DatePicker value={bookingDate} onChange={setBookingDate} />
          <TimePicker value={bookingTime} onChange={setBookingTime} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات العميل
          </label>
          <textarea
            name="notes"
            rows={3}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات إدارية
          </label>
          <textarea
            name="admin_notes"
            rows={3}
            className="input-field"
          />
        </div>

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
            <span>تم إنشاء الحجز بنجاح</span>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          إنشاء الحجز
        </Button>
      </form>

      {loading && <LoadingSpinner />}
    </motion.div>
  );
};