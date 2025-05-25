import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, CheckCircle, Save, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { BackButton } from '../../ui/BackButton';
import { useInspectionDraft } from '../../../hooks/useInspectionDraft';
import { useEngineer } from '../../../hooks/useEngineer';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';
import { PhotoUploader } from '../PhotoUploader';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface InspectionFormProps {
  bookingId: string;
  onComplete?: () => void;
}

export interface Question {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'rating' | 'text';
  options?: { value: string; label: string }[];
  requiresPhoto?: boolean;
  requiresNote?: boolean;
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface InspectionSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface PropertyArea {
  id: string;
  title: string;
  sections: InspectionSection[];
}

export interface PropertyType {
  id: string;
  title: string;
  areas: PropertyArea[];
}

export const BaseInspectionForm = ({
  bookingId,
  propertyTypes,
  onComplete = () => {}
}: InspectionFormProps & { propertyTypes: PropertyType[] }) => {
  const { user } = useAuthStore();
  const { data: engineer } = useEngineer(user?.id);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    clientName: '',
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    reportDate: new Date().toISOString().split('T')[0],
    propertyDescription: '',
    neighborhood: '',
    propertyLocation: '',
    propertyArea: '',
  });
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when form opens
  useEffect(() => {
    // Force scroll to top when the form opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scrolling when form closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  const {
    draft,
    saveDraft,
    isSaving,
  } = useInspectionDraft(bookingId, engineer?.id || '');

  // Load draft data on mount
  useEffect(() => {
    if (draft?.data) {
      setAnswers(draft.data.answers || {});
      setPhotos(draft.data.photos || {});
      setNotes(draft.data.notes || {});
      setSelectedPropertyType(draft.data.propertyType || '');
      setSelectedArea(draft.data.area || '');
      setCurrentSectionIndex(draft.data.sectionIndex || 0);
      setOrderDetails(draft.data.orderDetails || orderDetails);
    }
  }, [draft]);

  // Auto-save when form data changes
  useEffect(() => {
    const debouncedSave = setTimeout(() => {
      if (Object.keys(answers).length > 0 || selectedPropertyType) {
        saveDraft({
          answers,
          photos,
          notes,
          propertyType: selectedPropertyType,
          area: selectedArea,
          sectionIndex: currentSectionIndex,
          orderDetails
        });
      }
    }, 1000);

    return () => clearTimeout(debouncedSave);
  }, [answers, photos, notes, selectedPropertyType, selectedArea, currentSectionIndex, orderDetails, saveDraft]);

  // Notify parent components when the form opens or closes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('inspection-form-open'));
    
    return () => {
      window.dispatchEvent(new CustomEvent('inspection-form-close'));
    };
  }, []);

  const handlePhotoUpload = (questionId: string, url: string) => {
    setPhotos(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), url]
    }));
  };

  const handleAnswer = (sectionId: string, questionId: string, value: any) => {
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

  const handleOrderDetailChange = (field: string, value: string) => {
    setOrderDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentSections = () => {
    if (!selectedPropertyType || !selectedArea) return [];
    
    const propertyType = propertyTypes.find(pt => pt.id === selectedPropertyType);
    if (!propertyType) return [];
    
    const area = propertyType.areas.find(a => a.id === selectedArea);
    if (!area) return [];
    
    return area.sections;
  };

  const currentSections = getCurrentSections();
  const currentSection = currentSections[currentSectionIndex];

  const handleNext = () => {
    // Validate current section if we're in a section
    if (currentSection) {
      for (const question of currentSection.questions) {
        // Skip conditional questions that don't apply
        if (question.conditional) {
          const dependsOnValue = answers[currentSection.id]?.[question.conditional.dependsOn];
          if (dependsOnValue !== question.conditional.value) {
            continue;
          }
        }
        
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
    } else if (!selectedPropertyType) {
      // Validate property type selection
      if (!selectedPropertyType) {
        setError('الرجاء اختيار نوع العقار');
        return;
      }
      
      // Validate order details
      if (!orderDetails.clientName) {
        setError('الرجاء إدخال اسم العميل');
        return;
      }
      
      if (!orderDetails.orderNumber) {
        setError('الرجاء إدخال رقم الطلب');
        return;
      }
      
      if (!orderDetails.propertyLocation) {
        setError('الرجاء إدخال موقع العقار');
        return;
      }
      
      // Move to area selection
      setSelectedArea(propertyTypes.find(pt => pt.id === selectedPropertyType)?.areas[0]?.id || '');
      setError(null);
      return;
    } else if (!selectedArea) {
      // Validate area selection
      if (!selectedArea) {
        setError('الرجاء اختيار منطقة الفحص');
        return;
      }
      
      // Move to first section
      setCurrentSectionIndex(0);
      setError(null);
      return;
    }

    setError(null);
    if (currentSectionIndex < currentSections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // We're at the last section, show preview
      setShowPreview(true);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else if (selectedArea) {
      setSelectedArea('');
    } else if (selectedPropertyType) {
      setSelectedPropertyType('');
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
      
      // Add order details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`اسم العميل: ${orderDetails.clientName}`, 190, 30, { align: 'right' });
      pdf.text(`رقم الطلب: ${orderDetails.orderNumber}`, 190, 35, { align: 'right' });
      pdf.text(`تاريخ الطلب: ${orderDetails.orderDate}`, 190, 40, { align: 'right' });
      pdf.text(`تاريخ التقرير: ${orderDetails.reportDate}`, 190, 45, { align: 'right' });
      pdf.text(`الحي: ${orderDetails.neighborhood}`, 190, 50, { align: 'right' });
      pdf.text(`موقع العقار: ${orderDetails.propertyLocation}`, 190, 55, { align: 'right' });
      pdf.text(`مساحة العقار: ${orderDetails.propertyArea}`, 190, 60, { align: 'right' });
      
      let yPosition = 70;
      
      // Get property type and areas
      const propertyType = propertyTypes.find(pt => pt.id === selectedPropertyType);
      if (!propertyType) {
        throw new Error('نوع العقار غير محدد');
      }
      
      // Add property type
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(`نوع العقار: ${propertyType.title}`, 190, yPosition, { align: 'right' });
      yPosition += 10;
      
      // For each area
      for (const area of propertyType.areas) {
        if (area.id === selectedArea) {
          // Add area title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.text(area.title, 190, yPosition, { align: 'right' });
          yPosition += 10;
          
          // For each section
          for (const section of area.sections) {
            // Add section title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text(section.title, 190, yPosition, { align: 'right' });
            yPosition += 8;
            
            // Add questions and answers
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            
            for (const question of section.questions) {
              // Skip conditional questions that don't apply
              if (question.conditional) {
                const dependsOnValue = answers[section.id]?.[question.conditional.dependsOn];
                if (dependsOnValue !== question.conditional.value) {
                  continue;
                }
              }
              
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
                } else if (question.type === 'text') {
                  answerText = answer;
                }
                
                // Add question and answer
                pdf.text(`${question.text}: ${answerText}`, 190, yPosition, { align: 'right' });
                yPosition += 6;
                
                // Add notes if any
                const note = notes[`${section.id}_${question.id}`];
                if (note) {
                  pdf.text(`ملاحظات: ${note}`, 190, yPosition, { align: 'right' });
                  yPosition += 6;
                }
                
                // Check if we need a new page
                if (yPosition > 270) {
                  pdf.addPage();
                  yPosition = 20;
                }
              }
            }
            
            yPosition += 8;
            
            // Check if we need a new page
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
          }
        }
      }
      
      // Save the PDF
      pdf.save(`تقرير_فحص_${orderDetails.orderNumber}.pdf`);
      
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
      const propertyType = propertyTypes.find(pt => pt.id === selectedPropertyType);
      if (!propertyType) {
        throw new Error('نوع العقار غير محدد');
      }
      
      const area = propertyType.areas.find(a => a.id === selectedArea);
      if (!area) {
        throw new Error('منطقة الفحص غير محددة');
      }
      
      for (const section of area.sections) {
        for (const question of section.questions) {
          // Skip conditional questions that don't apply
          if (question.conditional) {
            const dependsOnValue = answers[section.id]?.[question.conditional.dependsOn];
            if (dependsOnValue !== question.conditional.value) {
              continue;
            }
          }
          
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
      const { data: inspection, error: inspectionError } = await supabase.rpc('submit_inspection', {
        p_booking_id: bookingId,
        p_property_type: selectedPropertyType,
        p_area: selectedArea,
        p_answers: answers,
        p_photos: photos,
        p_notes: notes,
        p_order_details: orderDetails
      });

      if (inspectionError) {
        throw inspectionError;
      }

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

  const renderContent = () => {
    if (!selectedPropertyType) {
      // Step 1: Property Type Selection and Order Details
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-y-auto max-h-[calc(100vh-16rem)]"
        >
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-lg mb-4">بيانات الطلب</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
                <input
                  type="text"
                  value={orderDetails.clientName}
                  onChange={(e) => handleOrderDetailChange('clientName', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="اسم العميل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الطلب</label>
                <input
                  type="text"
                  value={orderDetails.orderNumber}
                  onChange={(e) => handleOrderDetailChange('orderNumber', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="رقم الطلب"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الطلب</label>
                <input
                  type="date"
                  value={orderDetails.orderDate}
                  onChange={(e) => handleOrderDetailChange('orderDate', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التقرير</label>
                <input
                  type="date"
                  value={orderDetails.reportDate}
                  onChange={(e) => handleOrderDetailChange('reportDate', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
                <input
                  type="text"
                  value={orderDetails.neighborhood}
                  onChange={(e) => handleOrderDetailChange('neighborhood', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="الحي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">موقع العقار</label>
                <input
                  type="text"
                  value={orderDetails.propertyLocation}
                  onChange={(e) => handleOrderDetailChange('propertyLocation', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="موقع العقار"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف العقار</label>
                <input
                  type="text"
                  value={orderDetails.propertyDescription}
                  onChange={(e) => handleOrderDetailChange('propertyDescription', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="وصف العقار"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مساحة العقار</label>
                <input
                  type="text"
                  value={orderDetails.propertyArea}
                  onChange={(e) => handleOrderDetailChange('propertyArea', e.target.value)}
                  className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  placeholder="مساحة العقار"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-lg mb-4">نوع العقار</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedPropertyType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    selectedPropertyType === type.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  {type.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        </motion.div>
      );
    } else if (!selectedArea) {
      // Step 2: Area Selection
      const propertyType = propertyTypes.find(pt => pt.id === selectedPropertyType);
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-y-auto max-h-[calc(100vh-16rem)]"
        >
      if (!propertyType) return null;
      
      return (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-lg mb-4">منطقة الفحص</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {propertyType.areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    selectedArea === area.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  {area.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        </motion.div>
      );
    } else {
      // Step 3: Section Questions
      if (!currentSection) return null;
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]"
        >
          {currentSection.questions.map((question) => {
            // Skip conditional questions that don't apply
            if (question.conditional) {
              const dependsOnValue = answers[currentSection.id]?.[question.conditional.dependsOn];
              if (dependsOnValue !== question.conditional.value) {
                return null;
              }
            }
            
            return (
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
                    className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                  >
                    <option value="">اختر...</option>
                    {question.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={answers[currentSection.id]?.[question.id] || ''}
                    onChange={(e) => handleAnswer(currentSection.id, question.id, e.target.value)}
                    className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                    placeholder="أدخل النص هنا..."
                  />
                )}
                
                {question.type === 'rating' && (
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2">
                    {Array.from({ length: 10 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(currentSection.id, question.id, i + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${
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

                {/* Show "Other" text field if selected */}
                {question.type === 'select' && 
                 answers[currentSection.id]?.[question.id] === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={notes[`${currentSection.id}_${question.id}_other`] || ''}
                      onChange={(e) => handleNote(`${currentSection.id}_${question.id}_other`, e.target.value)}
                      className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                      placeholder="يرجى التحديد..."
                    />
                  </div>
                )}

                {/* Show notes input if answer is "No" and notes are required */}
                {question.requiresNote && 
                 answers[currentSection.id]?.[question.id] === false && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرجاء إضافة ملاحظة:
                    </label>
                    <textarea
                      value={notes[`${currentSection.id}_${question.id}`] || ''}
                      onChange={(e) => handleNote(`${currentSection.id}_${question.id}`, e.target.value)}
                      className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                      rows={3}
                      placeholder="اكتب ملاحظاتك هنا..."
                    />
                  </div>
                )}
                
                {/* Show photo uploader if required */}
                {(question.requiresPhoto || 
                  (question.requiresPhoto === undefined && 
                   (answers[currentSection.id]?.[question.id] === true || 
                    answers[currentSection.id]?.[question.id] === false))) && (