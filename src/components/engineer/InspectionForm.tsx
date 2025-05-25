import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useInspectionDraft } from '../../hooks/useInspectionDraft'; 
import { useInspectionDraft } from '../../hooks/useInspectionDraft'; 
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface InspectionFormProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionForm = ({ bookingId, onComplete }: InspectionFormProps) => {
  const { user } = useAuthStore();
  const { draft, saveDraft, isSaving } = useInspectionDraft(bookingId, user?.id || '');

  const [formData, setFormData] = useState({
    property_age: '',
    total_area: '',
    floor_count: '',
    foundation_type: '',
    foundation_condition: 'good',
    wall_condition: 'good',
    roof_condition: 'good',
    property_safe: true,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (draft?.data) {
      setFormData(draft.data);
    }
  }, [draft]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newData = {
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    };
    setFormData(newData);
    saveDraft(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('inspections')
        .insert({
          booking_id: bookingId,
          engineer_id: user?.id,
          ...formData,
          property_age: parseInt(formData.property_age),
          total_area: parseFloat(formData.total_area),
          floor_count: parseInt(formData.floor_count)
        });

      if (submitError) throw submitError;

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditions = ['excellent', 'good', 'fair', 'poor'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">تقرير الفحص</h2>
          <Button onClick={onComplete} variant="outline">
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="property_age" className="block text-sm font-medium text-gray-700">
                عمر العقار (بالسنوات)
              </label>
              <input
                type="number"
                id="property_age"
                name="property_age"
                value={formData.property_age}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="total_area" className="block text-sm font-medium text-gray-700">
                المساحة الكلية (متر مربع)
              </label>
              <input
                type="number"
                id="total_area"
                name="total_area"
                value={formData.total_area}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="floor_count" className="block text-sm font-medium text-gray-700">
                عدد الطوابق
              </label>
              <input
                type="number"
                id="floor_count"
                name="floor_count"
                value={formData.floor_count}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="foundation_type" className="block text-sm font-medium text-gray-700">
                نوع الأساسات
              </label>
              <input
                type="text"
                id="foundation_type"
                name="foundation_type"
                value={formData.foundation_type}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">حالة العناصر الإنشائية</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="foundation_condition" className="block text-sm font-medium text-gray-700">
                  حالة الأساسات
                </label>
                <select
                  id="foundation_condition"
                  name="foundation_condition"
                  value={formData.foundation_condition}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition === 'excellent' ? 'ممتاز' : 
                       condition === 'good' ? 'جيد' : 
                       condition === 'fair' ? 'متوسط' : 'ضعيف'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wall_condition" className="block text-sm font-medium text-gray-700">
                  حالة الجدران
                </label>
                <select
                  id="wall_condition"
                  name="wall_condition"
                  value={formData.wall_condition}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition === 'excellent' ? 'ممتاز' : 
                       condition === 'good' ? 'جيد' : 
                       condition === 'fair' ? 'متوسط' : 'ضعيف'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="roof_condition" className="block text-sm font-medium text-gray-700">
                  حالة السقف
                </label>
                <select
                  id="roof_condition"
                  name="roof_condition"
                  value={formData.roof_condition}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition === 'excellent' ? 'ممتاز' : 
                       condition === 'good' ? 'جيد' : 
                       condition === 'fair' ? 'متوسط' : 'ضعيف'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="property_safe"
                name="property_safe"
                checked={formData.property_safe}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="property_safe" className="text-lg font-medium">
                العقار آمن للسكن
              </label>
            </div>
            <p className="text-sm text-gray-500">
              يرجى التأكد من تقييم جميع جوانب السلامة قبل تحديد هذا الخيار
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="أي ملاحظات أو توصيات إضافية..."
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

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onComplete}
            >
              إلغاء
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="w-5 h-5" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>حفظ التقرير</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {isSaving && (
          <div className="fixed bottom-4 left-4 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <LoadingSpinner className="w-4 h-4" />
            <span>جاري حفظ المسودة...</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>
    </motion.form>
  );
};