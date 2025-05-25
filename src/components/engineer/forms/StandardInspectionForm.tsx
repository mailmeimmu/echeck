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
  propertyType: string;
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

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

// البلاط
const tilesSection: Section = {
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
        { value: 'ceramic', label: 'سيراميك' },
        { value: 'parquet', label: 'باركيه' },
        { value: 'carpet', label: 'موكيت' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'has_hollow_spots',
      text: 'هل يوجد تطبيل في الأرضيات؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_bathroom_wall_hollow',
      text: 'هل يوجد تطبيل في جدران دورات المياه؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_kitchen_wall_hollow',
      text: 'هل يوجد تطبيل في جدران المطبخ؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'levelness_good',
      text: 'هل يُعتبر استواء الأرضيات جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'slope_good',
      text: 'هل يُعتبر ميول الأرضيات جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'slip_resistant',
      text: 'هل يُعتبر بلاط دورات المياه خشن ومقاوم للانزلاق؟',
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
      id: 'stairs_tile_type',
      text: 'نوع بلاط الدرج',
      type: 'select',
      options: [
        { value: 'porcelain', label: 'بورسلان' },
        { value: 'marble', label: 'رخام' },
        { value: 'ceramic', label: 'سيراميك' },
        { value: 'parquet', label: 'باركيه' },
        { value: 'carpet', label: 'موكيت' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'has_stairs_hollow',
      text: 'هل يوجد تطبيل في الدرج؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'stairs_slope_good',
      text: 'هل يُعتبر ميول أرضيات الدرج جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'stairs_height_good',
      text: 'هل يُعتبر ارتفاع بلاط الدرج مناسب؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للبلاط (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// الجدران
const wallsSection: Section = {
  id: 'walls',
  title: 'الجدران',
  questions: [
    {
      id: 'condition_good',
      text: 'هل الجدران بحالة جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_cracks',
      text: 'هل يوجد تشققات بالجدران؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'paint_good',
      text: 'هل الدهان بشكل عام جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_water_damage',
      text: 'هل يوجد أثر تسربات مياه على الجدران؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للجدران (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// الكهرباء
const electricalSection: Section = {
  id: 'electrical',
  title: 'الكهرباء',
  questions: [
    {
      id: 'switches_quality_good',
      text: 'هل المفاتيح والمقابس الكهربائية ذات جودة جيدة ومطابقة للمواصفات والمقاييس؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'switches_operation_good',
      text: 'هل سلاسة الفتح والإقفال للمفاتيح الكهربائية تعمل بشكل جيد؟',
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
      text: 'هل مواقع الأفياش يعتبر جيد؟',
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
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_satellite_phone',
      text: 'هل يوجد تأسيس للستلايت والهاتف؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للكهرباء (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// السباكة
const plumbingSection: Section = {
  id: 'plumbing',
  title: 'السباكة',
  questions: [
    {
      id: 'has_sink_trap',
      text: 'هل تم تركيب مصائد مياه (كوع ريحة) أسفل المغسلة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'fixtures_quality_good',
      text: 'هل الأدوات الصحية ذات جودة جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'drains_good',
      text: 'هل تم تركيب الصفايات بشكل جيد ومقاومة للصدأ؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'water_pressure_good',
      text: 'هل قوة ضغط المياه جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'kitchen_plumbing_good',
      text: 'هل تم تأسيس السباكة داخل المطبخ بشكل جيد؟',
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
      id: 'rain_gutters_installed',
      text: 'هل تم تركيب مزراب للمواسير لتصريف مياه الأمطار؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'tank_covers_quality_good',
      text: 'هل تعتبر أغطية الخزانات ذات جودة عالية ومقاومة للانكسارات؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للسباكة (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// الأبواب
const doorsSection: Section = {
  id: 'doors',
  title: 'الأبواب',
  questions: [
    {
      id: 'exterior_door_type',
      text: 'نوع الأبواب الخارجية؟',
      type: 'select',
      options: [
        { value: 'stainless_steel', label: 'حديد مقاوم للصدأ' },
        { value: 'cladding', label: 'كلادينج' },
        { value: 'glass', label: 'زجاج' },
        { value: 'steel', label: 'حديد غير مقاوم للصدأ' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'garage_door_type',
      text: 'نوع أبواب مدخل السيارة؟',
      type: 'select',
      options: [
        { value: 'roll', label: 'رول' },
        { value: 'stainless_steel', label: 'حديد مقاوم للصدأ' },
        { value: 'cladding', label: 'كلادينج' },
        { value: 'glass', label: 'زجاج' },
        { value: 'steel', label: 'حديد غير مقاوم للصدأ' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'exterior_door_operation_good',
      text: 'هل سلاسة الفتح والإغلاق تعتبر جيدة للأبواب الخارجية؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'exterior_door_hardware_good',
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
      id: 'exterior_door_weight_good',
      text: 'هل تعتبر وزنية الأبواب الخارجية جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'interior_door_type',
      text: 'نوع الأبواب الداخلية؟',
      type: 'select',
      options: [
        { value: 'wood', label: 'خشب' },
        { value: 'moisture_resistant_wood', label: 'خشب مقاوم للرطوبة' },
        { value: 'glass', label: 'زجاج' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'bathroom_door_type',
      text: 'نوع أبواب دورات المياه؟',
      type: 'select',
      options: [
        { value: 'wood', label: 'خشب' },
        { value: 'moisture_resistant_wood', label: 'خشب مقاوم للرطوبة' },
        { value: 'glass', label: 'زجاج' },
        { value: 'aluminum', label: 'ألمنيوم' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'interior_door_operation_good',
      text: 'هل سلاسة الفتح والإغلاق تعتبر جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'interior_door_hardware_good',
      text: 'هل المقابض والمفصلات تعتبر جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'bathroom_safety_lock_installed',
      text: 'هل تم تركيب قفل الأمان (لكبار السن والأطفال) بدورات المياه؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للأبواب (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// الأسقف
const ceilingsSection: Section = {
  id: 'ceilings',
  title: 'الأسقف',
  questions: [
    {
      id: 'ceiling_type',
      text: 'نوع الأسقف؟',
      type: 'select',
      options: [
        { value: 'gypsum_board', label: 'جبس بورد' },
        { value: 'concrete', label: 'خرسانة' },
        { value: 'gypsum', label: 'جبس بلدي' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'has_ceiling_cracks',
      text: 'هل يوجد تشققات بالأسقف؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_ceiling_water_damage',
      text: 'هل يوجد أثر تسربات مياه على الأسقف؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للأسقف (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// النوافذ
const windowsSection: Section = {
  id: 'windows',
  title: 'النوافذ',
  questions: [
    {
      id: 'window_type',
      text: 'نوع النوافذ؟',
      type: 'select',
      options: [
        { value: 'non_heat_resistant', label: 'زجاج غير مقاوم للحرارة' },
        { value: 'heat_resistant', label: 'زجاج مقاوم للحرارة' },
        { value: 'other', label: 'أخرى' }
      ],
      requiresPhoto: true
    },
    {
      id: 'windows_standard_compliant',
      text: 'هل النوافذ مطابقة للمواصفات والمقاييس؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'windows_operation_good',
      text: 'هل سلاسة الفتح والإغلاق تعتبر جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'window_frames_good',
      text: 'هل الإطارات وربلات الألمنيوم تعتبر جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'has_insect_screens',
      text: 'هل تم تركيب شبك الحماية من الحشرات؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'window_size_appropriate',
      text: 'هل حجم النوافذ مناسب لمساحة المكان؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'window_slope_good',
      text: 'هل ميول مجرى النوافذ يعتبر جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'window_hardware_good',
      text: 'هل مقابض ومفصلات النوافذ تعتبر جيدة؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للنوافذ (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// التهوية والتكييف
const hvacSection: Section = {
  id: 'hvac',
  title: 'التهوية والتكييف',
  questions: [
    {
      id: 'exhaust_fans_working',
      text: 'هل تم تركيب مراوح الشفط وتعمل بشكل جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'ac_installation_prepared',
      text: 'هل تم تأسيس أماكن للمكيفات؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'ac_working_properly',
      text: 'في حال وجود تكييف هل يعمل بشكل جيد؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'ventilation_size_appropriate',
      text: 'هل حجم التهوية مناسب لمساحة المكان؟',
      type: 'boolean',
      requiresPhoto: true,
      requiresNote: true
    },
    {
      id: 'rating',
      text: 'التقييم العام للتهوية والتكييف (من 1 إلى 10)',
      type: 'rating'
    }
  ]
};

// All sections in order
const allSections: Section[] = [
  tilesSection,
  wallsSection,
  electricalSection,
  plumbingSection,
  doorsSection,
  ceilingsSection,
  windowsSection,
  hvacSection
];

export const StandardInspectionForm = ({ bookingId, onComplete = () => {}, propertyType }: InspectionFormProps) => {
  const { user } = useAuthStore();
  const { data: engineer } = useEngineer(user?.id);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
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
    floorLevel: 'الأرضي'
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
      setCurrentSectionIndex(draft.data.sectionIndex || 0);
      setOrderDetails(draft.data.orderDetails || orderDetails);
    }
  }, [draft]);

  // Auto-save when form data changes
  useEffect(() => {
    const debouncedSave = setTimeout(() => {
      if (Object.keys(answers).length > 0 || currentSectionIndex > 0) {
        saveDraft({
          answers,
          photos,
          notes,
          sectionIndex: currentSectionIndex,
          orderDetails
        });
      }
    }, 1000);

    return () => clearTimeout(debouncedSave);
  }, [answers, photos, notes, currentSectionIndex, orderDetails, saveDraft]);

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

  const currentSection = allSections[currentSectionIndex];

  const handleNext = () => {
    // Validate current section
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

    setError(null);
    if (currentSectionIndex < allSections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
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
      pdf.text(`نوع العقار: ${propertyType}`, 190, 65, { align: 'right' });
      pdf.text(`الدور: ${orderDetails.floorLevel}`, 190, 70, { align: 'right' });
      
      let yPosition = 80;
      
      // Add sections and answers
      for (const section of allSections) {
        // Add section title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
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
              
              if (answer === 'other') {
                const otherNote = notes[`${section.id}_${question.id}_other`];
                if (otherNote) {
                  answerText += `: ${otherNote}`;
                }
              }
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
      
      // Save the PDF
      pdf.save(`تقرير_فحص_${orderDetails.orderNumber || 'عقار'}.pdf`);
      
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
      for (const section of allSections) {
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
        p_property_type: propertyType,
        p_area: orderDetails.floorLevel,
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

  const renderOrderDetailsForm = () => {
    return (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
              <select
                value={orderDetails.floorLevel}
                onChange={(e) => handleOrderDetailChange('floorLevel', e.target.value)}
                className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
              >
                <option value="الموقع العام">الموقع العام</option>
                <option value="الأرضي">الأرضي</option>
                <option value="الأول">الأول</option>
                <option value="الثاني">الثاني</option>
                <option value="الأسطح">الأسطح</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          key="inspection-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full min-h-screen sm:min-h-0 sm:w-[95%] sm:max-w-3xl sm:max-h-[90vh] flex flex-col p-4 sm:p-6 my-0 sm:my-4 overflow-hidden"
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
                    notes,
                    sectionIndex: currentSectionIndex,
                    orderDetails
                  })}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المسودة</span>
                </Button>
                <button
                  onClick={() => !loading && onComplete()}
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
                    animate={{ width: `${((currentSectionIndex + 1) / (allSections.length + 1)) * 100}%` }}
                  />
                </div>

                {/* Section Title */}
                <motion.div
                  key={`title-${currentSectionIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center rtl py-2 sm:py-4 flex-shrink-0"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                    {currentSectionIndex === -1 ? 'بيانات الطلب' : currentSection.title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    الخطوة {currentSectionIndex + 1} من {allSections.length}
                  </p>
                </motion.div>

                {/* Questions */}
                <AnimatePresence mode="wait">
                  {currentSectionIndex === -1 ? (
                    <motion.div
                      key="order-details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-6 overflow-y-auto flex-grow px-1 pb-4 max-h-[calc(100vh-16rem)] sm:max-h-[calc(90vh-16rem)]"
                    >
                      {renderOrderDetailsForm()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`section-${currentSection.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-6 overflow-y-auto flex-grow px-1 pb-4 max-h-[calc(100vh-16rem)] sm:max-h-[calc(90vh-16rem)]"
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
                                onChange={(e) => handleNote(currentSection.id, question.id, e.target.value)}
                                className="w-full p-2 sm:p-3 rounded-xl border-2 border-gray-200 text-right"
                                rows={3}
                                placeholder="اكتب ملاحظاتك هنا..."
                              />
                            </div>
                          )}
                          
                          {/* Show photo uploader based on answer */}
                          {question.type === 'boolean' && (
                            <div>
                              {answers[currentSection.id]?.[question.id] === true ? (
                                <div className="mt-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صور عامة:
                                  </label>
                                  <PhotoUploader
                                    inspectionId={bookingId}
                                    section={`${currentSection.id}_${question.id}`}
                                    onUpload={(url) => handlePhotoUpload(`${currentSection.id}_${question.id}`, url)}
                                  />
                                </div>
                              ) : answers[currentSection.id]?.[question.id] === false ? (
                                <div className="mt-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صورة الملاحظة:
                                  </label>
                                  <PhotoUploader
                                    inspectionId={bookingId}
                                    section={`${currentSection.id}_${question.id}`}
                                    onUpload={(url) => handlePhotoUpload(`${currentSection.id}_${question.id}`, url)}
                                  />
                                </div>
                              ) : null}
                            </div>
                          )}
                          
                          {/* Show photo uploader for select questions */}
                          {question.type === 'select' && question.requiresPhoto && answers[currentSection.id]?.[question.id] && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                صور توثيقية:
                              </label>
                              <PhotoUploader
                                inspectionId={bookingId}
                                section={`${currentSection.id}_${question.id}`}
                                onUpload={(url) => handlePhotoUpload(`${currentSection.id}_${question.id}`, url)}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-2 sm:mt-4 pt-4 border-t border-gray-100 flex-shrink-0 sticky bottom-0 bg-white pb-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {currentSectionIndex >= 0 && (
                    <Button
                      onClick={handlePrevious}
                      variant="secondary"
                      className="flex-1"
                      disabled={loading}
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>السابق</span>
                    </Button>
                  )}
                  
                  {currentSectionIndex < allSections.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-md"
                      disabled={loading}
                    >
                      <span>التالي</span>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={() => setShowPreview(true)}
                        className="flex-1"
                        disabled={loading}
                      >
                        <FileText className="w-5 h-5" />
                        <span>معاينة التقرير</span>
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5"
                          >
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </motion.div>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>إرسال التقرير</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Preview Modal */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                  onClick={() => setShowPreview(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold">معاينة التقرير</h3>
                      <Button
                        variant="outline"
                        onClick={() => setShowPreview(false)}
                      >
                        <X className="w-5 h-5" />
                        <span>إغلاق</span>
                      </Button>
                    </div>

                    {/* Preview content */}
                    <div className="space-y-6">
                      <div className="border rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-4">بيانات الطلب</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <p><span className="font-medium">اسم العميل:</span> {orderDetails.clientName}</p>
                          <p><span className="font-medium">رقم الطلب:</span> {orderDetails.orderNumber}</p>
                          <p><span className="font-medium">تاريخ الطلب:</span> {orderDetails.orderDate}</p>
                          <p><span className="font-medium">تاريخ التقرير:</span> {orderDetails.reportDate}</p>
                          <p><span className="font-medium">الحي:</span> {orderDetails.neighborhood}</p>
                          <p><span className="font-medium">موقع العقار:</span> {orderDetails.propertyLocation}</p>
                          <p><span className="font-medium">مساحة العقار:</span> {orderDetails.propertyArea}</p>
                          <p><span className="font-medium">نوع العقار:</span> {propertyType}</p>
                          <p><span className="font-medium">الدور:</span> {orderDetails.floorLevel}</p>
                        </div>
                      </div>
                      
                      {allSections.map((section) => (
                        <div key={section.id} className="border rounded-xl p-4">
                          <h4 className="font-bold text-lg mb-4">{section.title}</h4>
                          <div className="space-y-4">
                            {section.questions.map(question => {
                              // Skip conditional questions that don't apply
                              if (question.conditional) {
                                const dependsOnValue = answers[section.id]?.[question.conditional.dependsOn];
                                if (dependsOnValue !== question.conditional.value) {
                                  return null;
                                }
                              }
                              
                              const answer = answers[section.id]?.[question.id];
                              if (answer === undefined) return null;
                              
                              let displayAnswer = '';
                              
                              if (question.type === 'boolean') {
                                displayAnswer = answer ? 'نعم' : 'لا';
                              } else if (question.type === 'select') {
                                const option = question.options?.find(opt => opt.value === answer);
                                displayAnswer = option?.label || answer;
                                
                                if (answer === 'other') {
                                  const otherNote = notes[`${section.id}_${question.id}_other`];
                                  if (otherNote) {
                                    displayAnswer += `: ${otherNote}`;
                                  }
                                }
                              } else if (question.type === 'rating') {
                                displayAnswer = `${answer}/10`;
                              } else if (question.type === 'text') {
                                displayAnswer = answer;
                              }
                              
                              return (
                                <div key={question.id} className="space-y-2">
                                  <p className="font-medium">{question.text}</p>
                                  <p className="text-gray-600">{displayAnswer}</p>
                                  {notes[`${section.id}_${question.id}`] && (
                                    <p className="text-sm text-gray-500">
                                      ملاحظات: {notes[`${section.id}_${question.id}`]}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        className="flex-1"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>إرسال التقرير</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowPreview(false)}
                        className="flex-1"
                      >
                        <span>تعديل</span>
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-right flex-shrink-0 shadow-sm"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {(loading && !pdfGenerating) && <LoadingSpinner />}
      
      {pdfGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ 
              rotate: 360 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-16 h-16 mb-4"
          >
            <FileText className="w-full h-full text-white" />
          </motion.div>
          <p className="text-white text-lg font-bold">جاري إنشاء التقرير...</p>
        </motion.div>
      )}
      
      {/* Hidden div for PDF generation */}
      <div className="hidden">
        <div ref={reportRef} className="p-8 bg-white" dir="rtl">
          {/* PDF content will be rendered here */}
        </div>
      </div>
    </AnimatePresence>
  );
};

export { StandardInspectionForm }