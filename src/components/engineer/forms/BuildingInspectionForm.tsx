import { BaseInspectionForm, InspectionFormProps, PropertyType } from './BaseInspectionForm';

// تعريف نموذج فحص المبنى
const buildingPropertyType: PropertyType = {
  id: 'building',
  title: 'عمارة',
  areas: [
    {
      id: 'exterior',
      title: 'الخارج',
      sections: [
        {
          id: 'structure',
          title: 'الهيكل الإنشائي',
          questions: [
            {
              id: 'building_age',
              text: 'عمر المبنى التقريبي',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'structure_type',
              text: 'نوع الهيكل الإنشائي',
              type: 'select',
              options: [
                { value: 'concrete', label: 'خرساني' },
                { value: 'steel', label: 'حديدي' },
                { value: 'mixed', label: 'مختلط' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'number_of_floors',
              text: 'عدد الطوابق',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'has_basement',
              text: 'هل يوجد قبو؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'has_structural_cracks',
              text: 'هل يوجد تشققات إنشائية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'foundation_condition',
              text: 'حالة الأساسات',
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
              id: 'rating',
              text: 'تقييم الهيكل الإنشائي (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'facade',
          title: 'الواجهة',
          questions: [
            {
              id: 'facade_material',
              text: 'مادة الواجهة',
              type: 'select',
              options: [
                { value: 'paint', label: 'دهان' },
                { value: 'stone', label: 'حجر' },
                { value: 'marble', label: 'رخام' },
                { value: 'glass', label: 'زجاج' },
                { value: 'aluminum', label: 'ألمنيوم' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
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
              text: 'هل يوجد تشققات في الواجهة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_water_damage',
              text: 'هل يوجد آثار تسرب مياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم الواجهة (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'roof',
          title: 'السطح',
          questions: [
            {
              id: 'roof_type',
              text: 'نوع السطح',
              type: 'select',
              options: [
                { value: 'concrete', label: 'خرساني' },
                { value: 'tiles', label: 'بلاط' },
                { value: 'metal', label: 'معدني' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_leaks',
              text: 'هل يوجد تسريب في السطح؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'insulation_quality',
              text: 'جودة العزل المائي والحراري',
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
              id: 'has_drainage',
              text: 'هل يوجد تصريف مياه الأمطار؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم السطح (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'common_areas',
      title: 'المناطق المشتركة',
      sections: [
        {
          id: 'entrance',
          title: 'المدخل والردهة',
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
              id: 'lobby_condition',
              text: 'حالة الردهة',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' },
                { value: 'none', label: 'غير موجودة' }
              ],
              requiresPhoto: true
            },
            {
              id: 'security_system',
              text: 'هل يوجد نظام أمان؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'intercom_system',
              text: 'هل يوجد نظام اتصال داخلي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم المدخل والردهة (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'stairs_elevators',
          title: 'السلالم والمصاعد',
          questions: [
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
              id: 'has_elevator',
              text: 'هل يوجد مصعد؟',
              type: 'boolean',
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
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_elevator',
                value: true
              }
            },
            {
              id: 'elevator_capacity',
              text: 'سعة المصعد',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_elevator',
                value: true
              }
            },
            {
              id: 'has_emergency_exits',
              text: 'هل يوجد مخارج طوارئ؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم السلالم والمصاعد (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'parking',
          title: 'مواقف السيارات',
          questions: [
            {
              id: 'has_parking',
              text: 'هل يوجد مواقف سيارات؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'parking_type',
              text: 'نوع المواقف',
              type: 'select',
              options: [
                { value: 'underground', label: 'تحت الأرض' },
                { value: 'covered', label: 'مغطاة' },
                { value: 'open', label: 'مكشوفة' },
                { value: 'mixed', label: 'مختلطة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_parking',
                value: true
              }
            },
            {
              id: 'parking_capacity',
              text: 'عدد المواقف',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_parking',
                value: true
              }
            },
            {
              id: 'parking_condition',
              text: 'حالة المواقف',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_parking',
                value: true
              }
            },
            {
              id: 'rating',
              text: 'تقييم مواقف السيارات (من 1 إلى 10)',
              type: 'rating',
              conditional: {
                dependsOn: 'has_parking',
                value: true
              }
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
              id: 'main_panel_condition',
              text: 'حالة اللوحة الرئيسية',
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
              id: 'has_generator',
              text: 'هل يوجد مولد كهربائي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
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
              id: 'water_supply_system',
              text: 'نظام إمداد المياه',
              type: 'select',
              options: [
                { value: 'city', label: 'شبكة المدينة' },
                { value: 'well', label: 'بئر' },
                { value: 'tanks', label: 'خزانات' },
                { value: 'mixed', label: 'مختلط' }
              ],
              requiresPhoto: true
            },
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
              id: 'has_water_tanks',
              text: 'هل يوجد خزانات مياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'water_tanks_capacity',
              text: 'سعة خزانات المياه (لتر)',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_water_tanks',
                value: true
              }
            },
            {
              id: 'has_leaks',
              text: 'هل يوجد تسريبات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
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
              id: 'has_central_ac',
              text: 'هل يوجد تكييف مركزي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'ac_condition',
              text: 'حالة نظام التكييف',
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
              ],
              requiresPhoto: false
            },
            {
              id: 'has_exhaust_system',
              text: 'هل يوجد نظام تهوية عادم؟',
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
        },
        {
          id: 'fire_safety',
          title: 'السلامة من الحرائق',
          questions: [
            {
              id: 'has_fire_alarm',
              text: 'هل يوجد نظام إنذار حريق؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_sprinklers',
              text: 'هل يوجد نظام رشاشات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_fire_extinguishers',
              text: 'هل يوجد طفايات حريق؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_fire_exits',
              text: 'هل يوجد مخارج طوارئ؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'fire_safety_compliance',
              text: 'هل المبنى متوافق مع متطلبات السلامة من الحرائق؟',
              type: 'boolean',
              requiresPhoto: false,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم السلامة من الحرائق (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    }
  ]
};

export const BuildingInspectionForm = (props: InspectionFormProps) => {
  return <BaseInspectionForm {...props} propertyTypes={[buildingPropertyType]} />;
};