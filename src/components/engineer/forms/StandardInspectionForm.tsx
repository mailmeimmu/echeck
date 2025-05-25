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
      pdf.text(`اسم العميل: ${orderDetails.clientName}`, 20, 40);
      pdf.text(`رقم الطلب: ${orderDetails.orderNumber}`, 20, 50);
      pdf.text(`تاريخ الطلب: ${orderDetails.orderDate}`, 20, 60);
      pdf.text(`تاريخ التقرير: ${orderDetails.reportDate}`, 20, 70);
      pdf.text(`وصف العقار: ${orderDetails.propertyDescription}`, 20, 80);
      pdf.text(`الحي: ${orderDetails.neighborhood}`, 20, 90);
      pdf.text(`موقع العقار: ${orderDetails.propertyLocation}`, 20, 100);
      pdf.text(`مساحة العقار: ${orderDetails.propertyArea}`, 20, 110);
      pdf.text(`الدور: ${orderDetails.floorLevel}`, 20, 120);
      
      // Add sections
      let yOffset = 140;
      
      for (const section of allSections) {
        // Add section title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(section.title, 105, yOffset, { align: 'center' });
        yOffset += 10;
        
        // Add questions and answers
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        
        for (const question of section.questions) {
          const answer = answers[section.id]?.[question.id];
          let answerText = '';
          
          if (question.type === 'boolean') {
            answerText = answer ? 'نعم' : 'لا';
          } else if (question.type === 'select') {
            const option = question.options?.find(opt => opt.value === answer);
            answerText = option?.label || '';
          } else if (question.type === 'rating') {
            answerText = answer?.toString() || '';
          }
          
          // Add question and answer
          pdf.text(`${question.text}: ${answerText}`, 20, yOffset);
          yOffset += 10;
          
          // Add note if exists
          const note = notes[`${section.id}_${question.id}`];
          if (note) {
            pdf.text(`ملاحظة: ${note}`, 30, yOffset);
            yOffset += 10;
          }
          
          // Check if we need a new page
          if (yOffset > 270) {
            pdf.addPage();
            yOffset = 20;
          }
        }
        
        yOffset += 10;
      }
      
      // Save the PDF
      pdf.save('تقرير-فحص-العقار.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="max-w-4xl mx-auto p-4 w-full flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <BackButton onClick={() => window.history.back()} />
          <h1 className="text-2xl font-bold text-center flex-1">نموذج فحص العقار</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {showModal && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">تفاصيل الطلب</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="اسم العميل"
                value={orderDetails.clientName}
                onChange={(e) => handleOrderDetailChange('clientName', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="رقم الطلب"
                value={orderDetails.orderNumber}
                onChange={(e) => handleOrderDetailChange('orderNumber', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="date"
                value={orderDetails.orderDate}
                onChange={(e) => handleOrderDetailChange('orderDate', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="date"
                value={orderDetails.reportDate}
                onChange={(e) => handleOrderDetailChange('reportDate', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="وصف العقار"
                value={orderDetails.propertyDescription}
                onChange={(e) => handleOrderDetailChange('propertyDescription', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="الحي"
                value={orderDetails.neighborhood}
                onChange={(e) => handleOrderDetailChange('neighborhood', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="موقع العقار"
                value={orderDetails.propertyLocation}
                onChange={(e) => handleOrderDetailChange('propertyLocation', e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="مساحة العقار"
                value={orderDetails.propertyArea}
                onChange={(e) => handleOrderDetailChange('propertyArea', e.target.value)}
                className="p-2 border rounded"
              />
              <select
                value={orderDetails.floorLevel}
                onChange={(e) => handleOrderDetailChange('floorLevel', e.target.value)}
                className="p-2 border rounded"
              >
                <option value="الأرضي">الأرضي</option>
                <option value="الأول">الأول</option>
                <option value="الثاني">الثاني</option>
                <option value="الثالث">الثالث</option>
                <option value="الرابع">الرابع</option>
              </select>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              متابعة
            </button>
          </div>
        )}

        {!showModal && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex-1 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">{currentSection.title}</h2>
              
              {currentSection.questions.map((question) => {
                // Skip conditional questions that don't apply
                if (question.conditional) {
                  const dependsOnValue = answers[currentSection.id]?.[question.conditional.dependsOn];
                  if (dependsOnValue !== question.conditional.value) {
                    return null;
                  }
                }

                return (
                  <div key={question.id} className="mb-6">
                    <label className="block text-lg mb-2">{question.text}</label>
                    
                    {question.type === 'boolean' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAnswer(currentSection.id, question.id, true)}
                          className={`px-4 py-2 rounded ${
                            answers[currentSection.id]?.[question.id] === true
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => handleAnswer(currentSection.id, question.id, false)}
                          className={`px-4 py-2 rounded ${
                            answers[currentSection.id]?.[question.id] === false
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200'
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
                        className="w-full p-2 border rounded"
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
                      <select
                        value={answers[currentSection.id]?.[question.id] || ''}
                        onChange={(e) => handleAnswer(currentSection.id, question.id, parseInt(e.target.value))}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">اختر تقييم...</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
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
                          placeholder="أضف ملاحظة..."
                          value={notes[`${currentSection.id}_${question.id}`] || ''}
                          onChange={(e) => handleNote(currentSection.id, question.id, e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentSectionIndex === 0}
                  className={`px-4 py-2 rounded ${
                    currentSectionIndex === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  السابق
                </button>
                
                {currentSectionIndex === allSections.length - 1 ? (
                  <button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    {pdfGenerating ? 'جاري إنشاء التقرير...' : 'إنشاء التقرير'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    التالي
                  </button>
                )}
              </div>
            </div>
            
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-4 px-4 flex gap-2 z-10 border-t border-gray-100">
              {isSaving ? (
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded flex items-center">
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  جاري الحفظ...
                </div>
              ) : (
                <div className="bg-green-100 text-green-600 px-4 py-2 rounded flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  تم الحفظ
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};