import { PropertyType } from '../BaseInspectionForm';

// تعريف نموذج فحص الشقة
export const apartmentPropertyType: PropertyType = {
  id: 'apartment',
  title: 'شقة',
  areas: [
    {
      id: 'interior',
      title: 'الداخل',
      sections: [
        {
          id: 'living_room',
          title: 'غرفة المعيشة',
          questions: [
            {
              id: 'floor_type',
              text: 'نوع الأرضية',
              type: 'select',
              options: [
                { value: 'ceramic', label: 'سيراميك' },
                { value: 'porcelain', label: 'بورسلين' },
                { value: 'marble', label: 'رخام' },
                { value: 'parquet', label: 'باركيه' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_hollow_spots',
              text: 'هل يوجد تطبيل في الأرضية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'wall_condition',
              text: 'حالة الجدران',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'ceiling_condition',
              text: 'حالة السقف',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتاز' },
                { value: 'good', label: 'جيد' },
                { value: 'fair', label: 'متوسط' },
                { value: 'poor', label: 'سيء' }
              ],
              requiresPhoto: true
            },
            {
              id: 'electrical_outlets',
              text: 'هل المخارج الكهربائية كافية وتعمل بشكل جيد؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم غرفة المعيشة (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'kitchen',
          title: 'المطبخ',
          questions: [
            {
              id: 'cabinet_quality',
              text: 'جودة خزائن المطبخ',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'countertop_material',
              text: 'مادة سطح العمل',
              type: 'select',
              options: [
                { value: 'granite', label: 'جرانيت' },
                { value: 'marble', label: 'رخام' },
                { value: 'corian', label: 'كوريان' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'plumbing_condition',
              text: 'حالة السباكة',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_water_leaks',
              text: 'هل يوجد تسريب مياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'ventilation_good',
              text: 'هل التهوية جيدة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم المطبخ (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'bathroom',
          title: 'الحمام',
          questions: [
            {
              id: 'fixtures_quality',
              text: 'جودة الأدوات الصحية',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_water_leaks',
              text: 'هل يوجد تسريب مياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'tile_condition',
              text: 'حالة البلاط',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'ventilation_good',
              text: 'هل التهوية جيدة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم الحمام (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'bedrooms',
          title: 'غرف النوم',
          questions: [
            {
              id: 'floor_type',
              text: 'نوع الأرضية',
              type: 'select',
              options: [
                { value: 'ceramic', label: 'سيراميك' },
                { value: 'porcelain', label: 'بورسلين' },
                { value: 'marble', label: 'رخام' },
                { value: 'parquet', label: 'باركيه' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'wall_condition',
              text: 'حالة الجدران',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'ceiling_condition',
              text: 'حالة السقف',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتاز' },
                { value: 'good', label: 'جيد' },
                { value: 'fair', label: 'متوسط' },
                { value: 'poor', label: 'سيء' }
              ],
              requiresPhoto: true
            },
            {
              id: 'electrical_outlets',
              text: 'هل المخارج الكهربائية كافية وتعمل بشكل جيد؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم غرف النوم (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'systems',
      title: 'الأنظمة',
      sections: [
        {
          id: 'electrical',
          title: 'النظام الكهربائي',
          questions: [
            {
              id: 'panel_condition',
              text: 'حالة لوحة الكهرباء',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'wiring_quality',
              text: 'جودة التمديدات الكهربائية',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_grounding',
              text: 'هل يوجد تأريض؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_safety_breakers',
              text: 'هل يوجد قواطع أمان؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم النظام الكهربائي (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'plumbing',
          title: 'نظام السباكة',
          questions: [
            {
              id: 'pipe_material',
              text: 'مادة الأنابيب',
              type: 'select',
              options: [
                { value: 'ppr', label: 'PPR' },
                { value: 'copper', label: 'نحاس' },
                { value: 'pvc', label: 'PVC' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'water_pressure',
              text: 'ضغط الماء',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتاز' },
                { value: 'good', label: 'جيد' },
                { value: 'fair', label: 'متوسط' },
                { value: 'poor', label: 'ضعيف' }
              ]
            },
            {
              id: 'has_leaks',
              text: 'هل يوجد تسريبات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'water_heater_condition',
              text: 'حالة سخان الماء',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' },
                { value: 'none', label: 'غير موجود' }
              ],
              requiresPhoto: true
            },
            {
              id: 'rating',
              text: 'تقييم نظام السباكة (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'hvac',
          title: 'نظام التكييف والتهوية',
          questions: [
            {
              id: 'ac_type',
              text: 'نوع التكييف',
              type: 'select',
              options: [
                { value: 'split', label: 'سبليت' },
                { value: 'central', label: 'مركزي' },
                { value: 'window', label: 'شباك' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'ac_condition',
              text: 'حالة التكييف',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' },
                { value: 'none', label: 'غير موجود' }
              ],
              requiresPhoto: true
            },
            {
              id: 'ventilation_quality',
              text: 'جودة التهوية',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ]
            },
            {
              id: 'has_exhaust_fans',
              text: 'هل يوجد مراوح شفط؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم نظام التكييف والتهوية (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'building',
      title: 'المبنى',
      sections: [
        {
          id: 'common_areas',
          title: 'المناطق المشتركة',
          questions: [
            {
              id: 'entrance_condition',
              text: 'حالة المدخل',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'stairs_condition',
              text: 'حالة السلالم',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'elevator_condition',
              text: 'حالة المصعد',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' },
                { value: 'none', label: 'غير موجود' }
              ],
              requiresPhoto: true
            },
            {
              id: 'parking_available',
              text: 'هل يوجد مواقف سيارات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم المناطق المشتركة (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'building_exterior',
          title: 'خارج المبنى',
          questions: [
            {
              id: 'facade_condition',
              text: 'حالة الواجهة',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_cracks',
              text: 'هل يوجد تشققات في الجدران الخارجية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'building_age',
              text: 'عمر المبنى التقريبي',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'rating',
              text: 'تقييم خارج المبنى (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    }
  ]
};