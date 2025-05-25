import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, CheckCircle, Save, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BackButton } from '../ui/BackButton';
import { useInspectionDraft } from '../../hooks/useInspectionDraft';
import { useEngineer } from '../../hooks/useEngineer';
import { useAuthStore } from '../../store/authStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useRef } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { supabase } from '../../lib/supabase'; 

interface InspectionFormProps {
  bookingId: string;
  onComplete?: () => void;
}

interface Step {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'rating';
  options?: { value: string; label: string }[];
  requiresPhoto?: boolean;
  requiresNote?: boolean;
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
        id: 'tile_quality',
        text: 'جودة البلاط ؟',
        type: 'select',
        options: [
          { value: 'hollowness', label: 'تطبيل' },
          { value: 'levelness', label: 'استواء' },
          { value: 'slope', label: 'ميول' }
        ],
        requiresPhoto: true
      },
      {
        id: 'has_hollow_spots',
        text: 'هل يوجد تطبيل في الارضيات؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'levelness_good',
        text: 'هل يعتبر استواء الارضيات جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'slope_good',
        text: 'هل يعتبر ميول الارضيات جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'slip_resistant',
        text: 'هل يعتبر البلاط خشن ومقاوم للانزلاق؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'skirting_good',
        text: 'هل تم تركيب الوزرات بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'expansion_joints_good',
        text: 'هل تم تركيب فواصل التمدد بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
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
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'has_cracks',
        text: 'هل يوجد تشققات بالجدران والواجهات؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'paint_good',
        text: 'هل الدهان بشكل عام جيدة؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'has_water_damage',
        text: 'هل يوجد اثر تسربات مياه على الجدران والواجهات؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
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
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'switches_quality_good',
        text: 'هل المفاتيح والمقابس الكهربائية ذات جوده جيدة ومطابقه للمواصفات والمقاييس؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'switches_operation_good',
        text: 'هل سلاسة الفتح والاقفال للمفاتيح الكهربائيه تعمل بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'lighting_distribution_good',
        text: 'هل تم توزيع الإضاءة بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'switch_locations_good',
        text: 'هل مواقع المفاتيح يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'socket_locations_good',
        text: 'هل مواقع الافياش يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'bulb_type_good',
        text: 'هل نوع اللمبات يعتبر جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'voltage_type',
        text: 'ماهو نوع جهد الكهرباء؟',
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
        text: 'هل الوصلات والتمديدات للعداد الكهربائي تعتبر جيده؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'outdoor_sockets_protected',
        text: 'هل تم تغطية وحماية الافياش الخارجية؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'garden_wiring_installed',
        text: 'هل تم تمديد الكهرباء لمنطقة الزراعة الخارجية؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
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
        text: 'هل تم تركيب عداد المياة ويعمل بشكل جيد؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'garden_plumbing_installed',
        text: 'هل تم تأسيس السباكة لمنطقة الزراعة الخارجية؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'drains_good',
        text: 'هل تم تركيب الصفايات بشكل جيد ومقاومة للصداء؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'rain_gutters_installed',
        text: 'هل تم تركيب مزراب للمواسير لتصريف مياة الامطار؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'tank_covers_quality_good',
        text: 'هل تعتبر اغطية الخزانات والصرف الصحي ذات جودة عالية ومقاومة للانكسارات؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
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
        text: 'نوع الأبواب الخارجية؟',
        type: 'select',
        options: [
          { value: 'stainless_steel', label: 'حديد مقاوم للصداء' },
          { value: 'cladding', label: 'كلادينج' },
          { value: 'glass', label: 'زجاج' },
          { value: 'steel', label: 'حديد غير مقاوم لصداء' },
          { value: 'other', label: 'أخرى' }
        ]
      },
      {
        id: 'garage_door_type',
        text: 'نوع أبواب مدخل السيارة؟',
        type: 'select',
        options: [
          { value: 'roll', label: 'رول' },
          { value: 'stainless_steel', label: 'حديد مقاوم للصداء' },
          { value: 'cladding', label: 'كلادينج' },
          { value: 'glass', label: 'زجاج' },
          { value: 'steel', label: 'حديد غير مقاوم لصداء' },
          { value: 'other', label: 'أخرى' }
        ]
      },
      {
        id: 'smooth_operation',
        text: 'هل سلاسة الفتح والاغلاق تعتبرجيدة للابواب الخارجية؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'hardware_good',
        text: 'هل مقابض ومفصلات الأبواب الخارجية تعتبر جيدة؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'door_stoppers_installed',
        text: 'هل تم تركيب مصدات خلف الأبواب؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'weight_balance_good',
        text: 'هل تعتبر وزنية الأبواب الخارجية جيدة؟',
        type: 'boolean',
        requiresPhoto: true,
        requiresNote: true
      },
      {
        id: 'rating',
        text: 'التقييم العام للأبواب',
        type: 'rating'
      }
    ]
  }
];

export default function InspectionForm({ bookingId, onComplete = () => {} }: InspectionFormProps) {
  const { user } = useAuthStore();
  const { data: engineer } = useEngineer(user?.id);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll to top when form opens
  useEffect(() => {
    // Force scroll to top when the form opens
    window.scrollTo(0, 0);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scrolling when modal closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  const {
    draft,
    saveDraft,
    isSaving,
    deleteDraft
  } = useInspectionDraft(bookingId, engineer?.id || '');

  // Load draft data on mount
  useEffect(() => {
    if (draft?.data) {
      setAnswers(draft.data.answers || {});
      setPhotos(draft.data.photos || {});
      setNotes(draft.data.notes || {});
    }
  }, [draft]);

  // Auto-save when form data changes
  useEffect(() => {
    const debouncedSave = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        saveDraft({
          answers,
          photos,
          notes
        });
      }
    }, 1000);

    return () => clearTimeout(debouncedSave);
  }, [answers, photos, notes, saveDraft]);

  // Notify parent components when the form opens or closes
  useEffect(() => {
    // Dispatch custom event when form opens
    window.dispatchEvent(new CustomEvent('inspection-form-open'));
    
    return () => {
      // Dispatch custom event when form closes
      window.dispatchEvent(new CustomEvent('inspection-form-close'));
    };
  }, []);

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

  const handleNote = (sectionId: string, questionId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [`${sectionId}_${questionId}`]: note
    }));
  };

  const currentSection = inspectionSections[currentStep];

  const handleNext = () => {
    // Validate current section
    for (const question of currentSection.questions) {
      const answer = answers[currentSection.id]?.[question.id];
      if (answer === undefined) {
        setError(`الرجاء الإجابة على السؤال: ${question.text}`);
        return;
      }
      
      if (question.requiresPhoto && (!photos[`${currentSection.id}_${question.id}`] || photos[`${currentSection.id}_${question.id}`].length === 0)) {
        setError(`الرجاء إرفاق صورة للسؤال: ${question.text}`);
        return;
      }

      if (question.requiresNote && answer === false && !notes[`${currentSection.id}_${question.id}`]) {
        setError(`الرجاء إضافة ملاحظة للسؤال: ${question.text}`);
        return;
      }
    }

    setError(null);
    if (currentStep < inspectionSections.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generatePDF = async () => {
    try {
      setPdfGenerating(true);
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('تقرير فحص العقار', 105, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`تاريخ الفحص: ${new Date().toLocaleDateString('ar-SA')}`, 105, 30, { align: 'center' });
      
      let yPosition = 40;
      
      // Add sections and answers
      for (const section of inspectionSections) {
        // Add section title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(section.title, 190, yPosition, { align: 'right' });
        yPosition += 10;
        
        // Add questions and answers
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        
        for (const question of section.questions) {
          const answer = answers[section.id]?.[question.id];
          
          if (answer !== undefined) {
            let answerText = '';
            
            if (question.type === 'boolean') {
              answerText = answer ? 'نعم' : 'لا';
            } else if (question.type === 'select') {
              const option = question.options?.find(opt => opt.value === answer);
              answerText = option?.label || answer;
            } else if (question.type === 'rating') {
              answerText = `${answer}/10`;
            }
            
            // Add question and answer
            pdf.text(`${question.text}: ${answerText}`, 190, yPosition, { align: 'right' });
            yPosition += 8;
            
            // Add notes if any
            const note = notes[`${section.id}_${question.id}`];
            if (note) {
              pdf.text(`ملاحظات: ${note}`, 190, yPosition, { align: 'right' });
              yPosition += 8;
            }
            
            // Check if we need a new page
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
          }
        }
        
        yPosition += 10;
        
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      }
      
      // Save the PDF
      pdf.save('تقرير_فحص_العقار.pdf');
      
      setPdfGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('حدث خطأ أثناء إنشاء ملف PDF');
      setPdfGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate all required fields
      for (const section of inspectionSections) {
        for (const question of section.questions) {
          const answer = answers[section.id]?.[question.id];
          if (answer === undefined) {
            throw new Error(`الرجاء الإجابة على السؤال: ${question.text} في قسم ${section.title}`);
          }
          
          if (question.requiresPhoto && (!photos[`${section.id}_${question.id}`] || photos[`${section.id}_${question.id}`].length === 0)) {
            throw new Error(`يرجى رفع صور توثيقية لـ ${question.text}`);
          }
          
          if (question.requiresNote && answer === false && !notes[`${section.id}_${question.id}`]) {
            throw new Error(`الرجاء إضافة ملاحظة للسؤال: ${question.text}`);
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
        p_photos: photos,
        p_notes: notes
      });

      // Generate PDF report
      await generatePDF();
      
      setSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في حفظ التقرير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          key="inspection-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
        >
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full h-screen sm:h-auto sm:w-[95%] sm:max-w-3xl sm:max-h-[90vh] flex flex-col p-4 sm:p-6 my-0 sm:my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-3 sm:mb-5 flex-shrink-0 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold">تقرير الفحص</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraft({
                    answers,
                    photos,
                    notes
                  })}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المسودة</span>
                </Button>
                <button
                  onClick={() => !loading && onComplete?.()}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={loading}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 sm:p-8 flex-grow flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                  className="inline-block p-3 bg-emerald-100 rounded-full mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-4">تم حفظ تقرير الفحص بنجاح</h2>
                <p className="text-gray-600 mb-6">
                  تم حفظ نتيجة الفحص وإكمال العملية
                </p>
                
                <Button onClick={onComplete} className="w-full sm:w-auto">
                  العودة للطلبات
                </Button>
              </motion.div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden flex-shrink-0 mb-4">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / inspectionSections.length) * 100}%` }}
                  />
                </div>

                {/* Section Title */}
                <motion.div
                  key={`title-${currentSection.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center rtl py-2 sm:py-4 flex-shrink-0"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{currentSection.title}</h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    الخطوة {currentStep + 1} من {inspectionSections.length}
                  </p>
                </motion.div>

                {/* Questions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`section-${currentSection.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 sm:space-y-6 overflow-y-auto flex-grow px-1 pb-4 max-h-[calc(100vh-20rem)] sm:max-h-[calc(90vh-16rem)]"
                  >
                    {currentSection.questions.map((question) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-3 sm:p-4 bg-gray-50 rounded-xl shadow-sm"
                      >
                        <h3 className="font-semibold text-base sm:text-lg text-right">{question.text}</h3>
                        
                        {question.type === 'boolean' && (
                          <div className="flex gap-2 sm:gap-4">
                            <button
                              onClick={() => handleAnswer(currentSection.id, question.id, true)}
                              className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-colors ${
                                answers[currentSection.id]?.[question.id] === true
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-emerald-500'
                              }`}
                            >
                              نعم
                            </button>
                            <button
                              onClick={() => handleAnswer(currentSection.id, question.id, false)}
                              className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-colors ${
                                answers[currentSection.id]?.[question.id] === false
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
                            value={answers[currentSection.id]?.[question.id] || ''}
                            onChange={(e) => handleAnswer(currentSection.id, question.id, e.target.value)}
                            className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none"
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
                          <div className="flex gap-2 flex-wrap">
                            {[...Array(10)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => handleAnswer(currentSection.id, question.id, i + 1)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 transition-colors ${
                                  answers[currentSection.id]?.[question.id] === i + 1
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
                          <div className="mt-4">
                            <PhotoUploader
                              onUpload={(url) => handlePhotoUpload(`${currentSection.id}_${question.id}`, url)}
                              photos={photos[`${currentSection.id}_${question.id}`] || []}
                            />
                          </div>
                        )}

                        {question.requiresNote && answers[currentSection.id]?.[question.id] === false && (
                          <div className="mt-4">
                            <textarea
                              value={notes[`${currentSection.id}_${question.id}`] || ''}
                              onChange={(e) => handleNote(currentSection.id, question.id, e.target.value)}
                              placeholder="أضف ملاحظاتك هنا..."
                              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none resize-none h-24"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </Button>

                  {currentStep === inspectionSections.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          حفظ التقرير
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-1"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}