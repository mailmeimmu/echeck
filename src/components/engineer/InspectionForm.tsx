import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle, Building, Shield, Home, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PhotoUploader } from './PhotoUploader';

interface InspectionFormProps {
  bookingId: string;
  propertyType: string;
}

interface InspectionSection {
  id: string;
  title: string;
  questions: {
    id: string;
    text: string;
    type: 'boolean' | 'select' | 'rating';
    options?: { value: string; label: string }[];
    requiresPhoto?: boolean;
  }[];
}

const inspectionSections: InspectionSection[] = [
  {
    id: 'tiles',
    title: 'البلاط',
    questions: [
      {
        id: 'tile_type',
        text: 'نوع البلاط',
        type: 'select',
        options: [
          { value: 'porcelain', label: 'بورسلان' },
          { value: 'marble', label: 'رخام' },
          { value: 'ceramic', label: 'سراميك' },
          { value: 'other', label: 'أخرى' }
        ],
        requiresPhoto: true
      },
      {
        id: 'has_hollow_spots',
        text: 'هل يوجد تطبيل في الارضيات؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'levelness_good',
        text: 'هل يعتبر استواء الارضيات جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'slope_good',
        text: 'هل يعتبر ميول الارضيات جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'slip_resistant',
        text: 'هل يعتبر البلاط خشن ومقاوم للانزلاق؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'skirting_good',
        text: 'هل تم تركيب الوزرات بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'expansion_joints_good',
        text: 'هل تم تركيب فواصل التمدد بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للبلاط',
        type: 'rating'
      }
    ]
  },
  {
    id: 'walls',
    title: 'الجدران والواجهات',
    questions: [
      {
        id: 'condition_good',
        text: 'هل الجدران والواجهات بحالة جيدة؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'has_cracks',
        text: 'هل يوجد تشققات بالجدران والواجهات؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'paint_good',
        text: 'هل الدهان بشكل عام جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'has_water_damage',
        text: 'هل يوجد اثر تسربات مياه على الجدران والواجهات؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للجدران والواجهات',
        type: 'rating'
      }
    ]
  },
  {
    id: 'electrical',
    title: 'الكهرباء',
    questions: [
      {
        id: 'meter_working',
        text: 'هل تم تركيب عداد الكهرباء الخارجي ويعمل بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'switches_quality_good',
        text: 'هل المفاتيح والمقابس الكهربائية ذات جودة جيدة ومطابقة للمواصفات والمقاييس؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'switches_operation_good',
        text: 'هل سلاسة الفتح والاقفال للمفاتيح الكهربائية تعمل بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'lighting_distribution_good',
        text: 'هل تم توزيع الإضاءة بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'switch_locations_good',
        text: 'هل مواقع المفاتيح يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'socket_locations_good',
        text: 'هل مواقع الافياش يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'bulb_type_good',
        text: 'هل نوع اللمبات يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'voltage_type',
        text: 'ما هو نوع جهد الكهرباء؟',
        type: 'select',
        options: [
          { value: '220', label: '220' },
          { value: '110', label: '110' },
          { value: '380', label: '380' },
          { value: 'other', label: 'أخرى' }
        ]
      },
      {
        id: 'meter_connections_good',
        text: 'هل الوصلات والتمديدات للعداد الكهربائي تعتبر جيدة؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'outdoor_sockets_protected',
        text: 'هل تم تغطية وحماية الافياش الخارجية؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'garden_wiring_installed',
        text: 'هل تم تمديد الكهرباء لمنطقة الزراعة الخارجية؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للكهرباء',
        type: 'rating'
      }
    ]
  },
  {
    id: 'plumbing',
    title: 'السباكة',
    questions: [
      {
        id: 'water_meter_working',
        text: 'هل تم تركيب عداد المياه ويعمل بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'garden_plumbing_installed',
        text: 'هل تم تأسيس السباكة لمنطقة الزراعة الخارجية؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'drains_good',
        text: 'هل تم تركيب الصفايات بشكل جيد ومقاومة للصداء؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rain_gutters_installed',
        text: 'هل تم تركيب مزراب للمواسير لتصريف مياه الامطار؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'tank_covers_quality_good',
        text: 'هل تعتبر اغطية الخزانات والصرف الصحي ذات جودة عالية ومقاومة للانكسارات؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للسباكة',
        type: 'rating'
      }
    ]
  },
  {
    id: 'doors',
    title: 'الأبواب',
    questions: [
      {
        id: 'exterior_door_type',
        text: 'نوع الأبواب الخارجية',
        type: 'select',
        options: [
          { value: 'stainless_steel', label: 'حديد مقاوم للصداء' },
          { value: 'cladding', label: 'كلادينج' },
          { value: 'glass', label: 'زجاج' },
          { value: 'steel', label: 'حديد غير مقاوم للصداء' },
          { value: 'other', label: 'أخرى' }
        ]
      },
      {
        id: 'garage_door_type',
        text: 'نوع أبواب مدخل السيارة',
        type: 'select',
        options: [
          { value: 'roll', label: 'رول' },
          { value: 'stainless_steel', label: 'حديد مقاوم للصداء' },
          { value: 'cladding', label: 'كلادينج' },
          { value: 'glass', label: 'زجاج' },
          { value: 'steel', label: 'حديد غير مقاوم للصداء' },
          { value: 'other', label: 'أخرى' }
        ]
      },
      {
        id: 'smooth_operation',
        text: 'هل سلاسة الفتح والاغلاق تعتبر جيدة للابواب الخارجية؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'hardware_good',
        text: 'هل مقابض ومفصلات الأبواب الخارجية تعتبر جيدة؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'door_stoppers_installed',
        text: 'هل تم تركيب مصدات خلف الأبواب؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'weight_balance_good',
        text: 'هل تعتبر وزنية الأبواب الخارجية جيدة؟',
        type: 'boolean',
        requiresPhoto: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للأبواب',
        type: 'rating'
      }
    ]
  }
];

export const InspectionForm = ({ bookingId, propertyType }: InspectionFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = (questionId: string, url: string) => {
    setPhotos(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), url]
    }));
  };

  const handleAnswer = async (sectionId: string, questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [questionId]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate all required fields
      for (const section of inspectionSections) {
        for (const question of section.questions) {
          if (question.requiresPhoto && (!photos[`${section.id}_${question.id}`] || photos[`${section.id}_${question.id}`].length === 0)) {
            throw new Error(`يرجى رفع صور توثيقية لـ ${question.text}`);
          }
        }
      }

      // Submit inspection data
      const { data: inspection } = await supabase.rpc('submit_inspection', {
        p_booking_id: bookingId,
        p_tiles_data: answers.tiles,
        p_walls_data: answers.walls,
        p_electrical_data: answers.electrical,
        p_plumbing_data: answers.plumbing,
        p_doors_data: answers.doors,
        p_photos: photos
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في حفظ التقرير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
            className="inline-block p-3 bg-emerald-100 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">تم حفظ تقرير الفحص بنجاح</h2>
          <p className="text-gray-600">
            تم حفظ نتيجة الفحص وإكمال العملية
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {inspectionSections.map((section) => (
            <div key={section.id} className="card">
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
              
              <div className="space-y-6">
                {section.questions.map((question) => (
                  <div key={question.id} className="space-y-4">
                    <h3 className="font-semibold">{question.text}</h3>
                    
                    {question.type === 'boolean' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAnswer(section.id, question.id, true)}
                          className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                            answers[section.id]?.[question.id] === true
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-500'
                          }`}
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => handleAnswer(section.id, question.id, false)}
                          className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                            answers[section.id]?.[question.id] === false
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-500'
                          }`}
                        >
                          لا
                        </button>
                      </div>
                    )}
                    
                    {question.type === 'select' && (
                      <select
                        value={answers[section.id]?.[question.id] || ''}
                        onChange={(e) => handleAnswer(section.id, question.id, e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-gray-200"
                      >
                        <option value="">اختر...</option>
                        {question.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {question.type === 'rating' && (
                      <div className="flex gap-2">
                        {Array.from({ length: 10 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => handleAnswer(section.id, question.id, i + 1)}
                            className={`w-10 h-10 rounded-full border-2 transition-colors ${
                              answers[section.id]?.[question.id] === i + 1
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-emerald-500'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {question.requiresPhoto && (
                      <PhotoUploader
                        inspectionId={bookingId}
                        section={`${section.id}_${question.id}`}
                        onUpload={(url) => handlePhotoUpload(`${section.id}_${question.id}`, url)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <Button onClick={handleSubmit} className="w-full">
            حفظ التقرير
          </Button>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {loading && <LoadingSpinner />}
    </motion.div>
  );
};