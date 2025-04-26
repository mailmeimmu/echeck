import { createContext, useContext } from 'react';

export type Language = 'ar' | 'en';

export interface Translation {
  [key: string]: {
    [key: string]: string | Record<string, string>;
  };
}

export const translations: Translation = {
  // ... (keeping existing auth translations)
  home: {
    ar: {
      welcome: 'مرحباً بك في شيك',
      subtitle: 'نحن هنا لمساعدتك في فحص عقارك بأعلى معايير الجودة',
      features: {
        inspection: 'فحص شامل',
        inspectionDesc: 'فحص دقيق لجميع جوانب العقار باستخدام أحدث التقنيات',
        speed: 'سرعة التنفيذ',
        speedDesc: 'نضمن إتمام الفحص وتسليم التقرير خلال 24 ساعة',
        expertise: 'خبرة عالية',
        expertiseDesc: 'فريق من المهندسين المعتمدين ذوي الخبرة العالية',
        support: 'دعم متواصل',
        supportDesc: 'فريق دعم متخصص لخدمتك على مدار الساعة'
      },
      cta: 'احجز فحصك الآن',
      noBookings: 'لا يوجد لديك حجوزات حالية',
      createBooking: 'قم بإنشاء حجزك الأول'
    },
    en: {
      welcome: 'Welcome to Check',
      subtitle: 'We\'re here to help inspect your property with the highest quality standards',
      features: {
        inspection: 'Comprehensive Inspection',
        inspectionDesc: 'Detailed inspection of all property aspects using latest technologies',
        speed: 'Fast Execution',
        speedDesc: 'We guarantee inspection completion and report delivery within 24 hours',
        expertise: 'High Expertise',
        expertiseDesc: 'Team of certified engineers with extensive experience',
        support: '24/7 Support',
        supportDesc: 'Specialized support team at your service around the clock'
      },
      cta: 'Book Your Inspection Now',
      noBookings: 'You have no current bookings',
      createBooking: 'Create your first booking'
    }
  },
  profile: {
    ar: {
      title: 'الملف الشخصي',
      personalInfo: 'المعلومات الشخصية',
      email: 'البريد الإلكتروني',
      name: 'الاسم',
      phone: 'رقم الجوال',
      bookings: 'حجوزاتي',
      noBookings: 'لا توجد حجوزات',
      updateSuccess: 'تم تحديث الملف الشخصي بنجاح',
      logout: 'تسجيل الخروج',
      bookingStatus: {
        pending: 'قيد المراجعة',
        approved: 'تمت الموافقة',
        confirmed: 'تم التأكيد',
        completed: 'مكتمل',
        cancelled: 'ملغي'
      }
    },
    en: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      email: 'Email',
      name: 'Name',
      phone: 'Phone Number',
      bookings: 'My Bookings',
      noBookings: 'No bookings found',
      updateSuccess: 'Profile updated successfully',
      logout: 'Logout',
      bookingStatus: {
        pending: 'Pending',
        approved: 'Approved',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled'
      }
    }
  },
  booking: {
    ar: {
      title: 'حجز موعد فحص',
      package: 'الباقة',
      propertyType: 'نوع العقار',
      location: 'الموقع',
      selectLocation: 'اختر موقع العقار',
      date: 'التاريخ',
      time: 'الوقت',
      notes: 'ملاحظات إضافية',
      phone: 'رقم الجوال',
      confirmBooking: 'تأكيد الحجز',
      bookingSuccess: 'تم تسجيل الحجز بنجاح',
      locationDetails: 'تفاصيل الموقع',
      searchLocation: 'ابحث عن الموقع',
      district: 'الحي',
      city: 'المدينة',
      propertyDetails: 'تفاصيل العقار',
      bookingDetails: 'تفاصيل الحجز'
    },
    en: {
      title: 'Book an Inspection',
      package: 'Package',
      propertyType: 'Property Type',
      location: 'Location',
      selectLocation: 'Select Property Location',
      date: 'Date',
      time: 'Time',
      notes: 'Additional Notes',
      phone: 'Phone Number',
      confirmBooking: 'Confirm Booking',
      bookingSuccess: 'Booking confirmed successfully',
      locationDetails: 'Location Details',
      searchLocation: 'Search Location',
      district: 'District',
      city: 'City',
      propertyDetails: 'Property Details',
      bookingDetails: 'Booking Details'
    }
  },
  packages: {
    ar: {
      title: 'باقات الفحص',
      subtitle: 'اختر الباقة المناسبة لاحتياجات عقارك',
      packages: {
        platinum: {
          name: 'بلاتينية',
          price: '2,200',
          features: '12 خدمة',
          description: 'فحص شامل للعقار مع تقرير مفصل وتوصيات متخصصة'
        },
        gold: {
          name: 'ذهبية',
          price: '1,500',
          features: '8 خدمات',
          description: 'فحص متكامل للعقار مع تقرير تفصيلي'
        },
        silver: {
          name: 'فضية',
          price: '800',
          features: '4 خدمات',
          description: 'فحص أساسي للعقار مع تقرير موجز'
        }
      },
      features: {
        title: 'مميزات خدمة الفحص',
        comprehensive: 'فحص شامل',
        speed: 'سرعة التنفيذ',
        expertise: 'خبرة عالية',
        support: 'دعم متواصل'
      },
      faq: {
        title: 'الأسئلة الشائعة',
        questions: {
          duration: 'كم تستغرق عملية الفحص؟',
          durationAnswer: 'تستغرق عملية الفحص من 2-4 ساعات حسب حجم العقار',
          report: 'متى أستلم التقرير؟',
          reportAnswer: 'يتم تسليم التقرير خلال 24 ساعة من انتهاء الفحص',
          engineers: 'هل المهندسين معتمدين؟',
          engineersAnswer: 'نعم، جميع مهندسينا معتمدين ولديهم خبرة عالية'
        }
      },
      selectPackage: 'اختيار الباقة',
      bookNow: 'احجز الآن'
    },
    en: {
      title: 'Inspection Packages',
      subtitle: 'Choose the package that suits your property needs',
      packages: {
        platinum: {
          name: 'Platinum',
          price: '2,200',
          features: '12 services',
          description: 'Comprehensive inspection with detailed report and specialized recommendations'
        },
        gold: {
          name: 'Gold',
          price: '1,500',
          features: '8 services',
          description: 'Complete inspection with detailed report'
        },
        silver: {
          name: 'Silver',
          price: '800',
          features: '4 services',
          description: 'Basic inspection with summary report'
        }
      },
      features: {
        title: 'Inspection Service Features',
        comprehensive: 'Comprehensive Inspection',
        speed: 'Fast Execution',
        expertise: 'High Expertise',
        support: '24/7 Support'
      },
      faq: {
        title: 'Frequently Asked Questions',
        questions: {
          duration: 'How long does the inspection take?',
          durationAnswer: 'The inspection takes 2-4 hours depending on property size',
          report: 'When do I receive the report?',
          reportAnswer: 'The report is delivered within 24 hours after inspection',
          engineers: 'Are the engineers certified?',
          engineersAnswer: 'Yes, all our engineers are certified with extensive experience'
        }
      },
      selectPackage: 'Select Package',
      bookNow: 'Book Now'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string, params?: Record<string, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: () => ''
});

export const useLanguage = () => useContext(LanguageContext);