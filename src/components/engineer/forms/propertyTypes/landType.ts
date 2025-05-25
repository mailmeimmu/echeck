import { PropertyType } from '../BaseInspectionForm';

// تعريف نموذج فحص الأرض
export const landPropertyType: PropertyType = {
  id: 'land',
  title: 'أرض',
  areas: [
    {
      id: 'general',
      title: 'عام',
      sections: [
        {
          id: 'land_details',
          title: 'تفاصيل الأرض',
          questions: [
            {
              id: 'land_type',
              text: 'نوع الأرض',
              type: 'select',
              options: [
                { value: 'residential', label: 'سكنية' },
                { value: 'commercial', label: 'تجارية' },
                { value: 'agricultural', label: 'زراعية' },
                { value: 'industrial', label: 'صناعية' },
                { value: 'mixed', label: 'مختلطة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'land_shape',
              text: 'شكل الأرض',
              type: 'select',
              options: [
                { value: 'rectangular', label: 'مستطيلة' },
                { value: 'square', label: 'مربعة' },
                { value: 'irregular', label: 'غير منتظمة' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'land_area',
              text: 'مساحة الأرض (متر مربع)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'land_dimensions',
              text: 'أبعاد الأرض',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'is_corner',
              text: 'هل الأرض ركنية؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'street_width',
              text: 'عرض الشارع (متر)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'rating',
              text: 'تقييم الأرض (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'soil_topography',
          title: 'التربة والطبوغرافيا',
          questions: [
            {
              id: 'soil_type',
              text: 'نوع التربة',
              type: 'select',
              options: [
                { value: 'sandy', label: 'رملية' },
                { value: 'clay', label: 'طينية' },
                { value: 'rocky', label: 'صخرية' },
                { value: 'mixed', label: 'مختلطة' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'is_level',
              text: 'هل الأرض مستوية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_slopes',
              text: 'هل يوجد انحدارات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'needs_leveling',
              text: 'هل تحتاج الأرض إلى تسوية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_rocks',
              text: 'هل يوجد صخور كبيرة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم التربة والطبوغرافيا (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'infrastructure',
      title: 'البنية التحتية',
      sections: [
        {
          id: 'utilities',
          title: 'المرافق',
          questions: [
            {
              id: 'has_electricity',
              text: 'هل يوجد كهرباء؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_water',
              text: 'هل يوجد ماء؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_sewage',
              text: 'هل يوجد صرف صحي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_internet',
              text: 'هل يوجد خدمة إنترنت؟',
              type: 'boolean',
              requiresPhoto: false,
              requiresNote: true
            },
            {
              id: 'distance_to_utilities',
              text: 'المسافة إلى أقرب نقطة مرافق (متر)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'rating',
              text: 'تقييم المرافق (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'access',
          title: 'الوصول',
          questions: [
            {
              id: 'road_condition',
              text: 'حالة الطريق المؤدي للأرض',
              type: 'select',
              options: [
                { value: 'paved', label: 'معبد' },
                { value: 'gravel', label: 'حصى' },
                { value: 'dirt', label: 'ترابي' },
                { value: 'none', label: 'لا يوجد' }
              ],
              requiresPhoto: true
            },
            {
              id: 'number_of_access_points',
              text: 'عدد نقاط الوصول',
              type: 'select',
              options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4+', label: '4 أو أكثر' }
              ],
              requiresPhoto: false
            },
            {
              id: 'distance_to_main_road',
              text: 'المسافة إلى الطريق الرئيسي (متر)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'public_transport_nearby',
              text: 'هل يوجد وسائل نقل عام قريبة؟',
              type: 'boolean',
              requiresPhoto: false,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم إمكانية الوصول (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'surroundings',
      title: 'المحيط',
      sections: [
        {
          id: 'neighborhood',
          title: 'الحي',
          questions: [
            {
              id: 'neighborhood_type',
              text: 'نوع الحي',
              type: 'select',
              options: [
                { value: 'residential', label: 'سكني' },
                { value: 'commercial', label: 'تجاري' },
                { value: 'mixed', label: 'مختلط' },
                { value: 'industrial', label: 'صناعي' },
                { value: 'rural', label: 'ريفي' }
              ],
              requiresPhoto: true
            },
            {
              id: 'development_level',
              text: 'مستوى تطور الحي',
              type: 'select',
              options: [
                { value: 'high', label: 'عالي' },
                { value: 'medium', label: 'متوسط' },
                { value: 'low', label: 'منخفض' },
                { value: 'undeveloped', label: 'غير مطور' }
              ],
              requiresPhoto: true
            },
            {
              id: 'nearby_services',
              text: 'الخدمات القريبة',
              type: 'select',
              options: [
                { value: 'many', label: 'كثيرة' },
                { value: 'some', label: 'بعض' },
                { value: 'few', label: 'قليلة' },
                { value: 'none', label: 'لا يوجد' }
              ],
              requiresPhoto: false
            },
            {
              id: 'noise_level',
              text: 'مستوى الضوضاء',
              type: 'select',
              options: [
                { value: 'high', label: 'عالي' },
                { value: 'medium', label: 'متوسط' },
                { value: 'low', label: 'منخفض' }
              ],
              requiresPhoto: false
            },
            {
              id: 'rating',
              text: 'تقييم الحي (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'environmental',
          title: 'العوامل البيئية',
          questions: [
            {
              id: 'flood_risk',
              text: 'خطر الفيضانات',
              type: 'select',
              options: [
                { value: 'high', label: 'عالي' },
                { value: 'medium', label: 'متوسط' },
                { value: 'low', label: 'منخفض' },
                { value: 'none', label: 'لا يوجد' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_natural_water',
              text: 'هل يوجد مصادر مياه طبيعية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_vegetation',
              text: 'هل يوجد نباتات أو أشجار؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_environmental_hazards',
              text: 'هل يوجد مخاطر بيئية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم العوامل البيئية (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'legal',
      title: 'الجوانب القانونية',
      sections: [
        {
          id: 'zoning',
          title: 'التقسيم والتنظيم',
          questions: [
            {
              id: 'zoning_type',
              text: 'نوع التقسيم',
              type: 'select',
              options: [
                { value: 'residential', label: 'سكني' },
                { value: 'commercial', label: 'تجاري' },
                { value: 'agricultural', label: 'زراعي' },
                { value: 'industrial', label: 'صناعي' },
                { value: 'mixed', label: 'مختلط' }
              ],
              requiresPhoto: false
            },
            {
              id: 'building_ratio',
              text: 'نسبة البناء المسموحة',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'floor_ratio',
              text: 'عدد الطوابق المسموحة',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'has_building_restrictions',
              text: 'هل يوجد قيود بناء؟',
              type: 'boolean',
              requiresPhoto: false,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم التقسيم والتنظيم (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'boundaries',
          title: 'الحدود',
          questions: [
            {
              id: 'has_clear_boundaries',
              text: 'هل حدود الأرض واضحة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_fence',
              text: 'هل يوجد سور؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'fence_condition',
              text: 'حالة السور',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' },
                { value: 'none', label: 'غير موجود' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_fence',
                value: true
              }
            },
            {
              id: 'has_boundary_disputes',
              text: 'هل يوجد نزاعات على الحدود؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم الحدود (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    }
  ]
};