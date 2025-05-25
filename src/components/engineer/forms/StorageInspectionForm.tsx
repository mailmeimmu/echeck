import { BaseInspectionForm, InspectionFormProps, PropertyType } from './BaseInspectionForm';

// تعريف نموذج فحص المستودع
const storagePropertyType: PropertyType = {
  id: 'storage',
  title: 'مستودع',
  areas: [
    {
      id: 'structure',
      title: 'الهيكل',
      sections: [
        {
          id: 'main_structure',
          title: 'الهيكل الرئيسي',
          questions: [
            {
              id: 'building_type',
              text: 'نوع المبنى',
              type: 'select',
              options: [
                { value: 'concrete', label: 'خرساني' },
                { value: 'steel', label: 'حديدي' },
                { value: 'prefab', label: 'مسبق الصنع' },
                { value: 'mixed', label: 'مختلط' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'building_age',
              text: 'عمر المبنى التقريبي',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'ceiling_height',
              text: 'ارتفاع السقف (متر)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'floor_area',
              text: 'مساحة الأرضية (متر مربع)',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'has_structural_cracks',
              text: 'هل يوجد تشققات إنشائية؟',
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
              text: 'تقييم الهيكل الرئيسي (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'roof',
          title: 'السقف',
          questions: [
            {
              id: 'roof_type',
              text: 'نوع السقف',
              type: 'select',
              options: [
                { value: 'concrete', label: 'خرساني' },
                { value: 'metal', label: 'معدني' },
                { value: 'sandwich_panel', label: 'ألواح ساندويتش' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'has_leaks',
              text: 'هل يوجد تسريب في السقف؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'insulation_quality',
              text: 'جودة العزل',
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
              id: 'has_skylights',
              text: 'هل يوجد فتحات إضاءة سقفية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم السقف (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'floor',
          title: 'الأرضية',
          questions: [
            {
              id: 'floor_type',
              text: 'نوع الأرضية',
              type: 'select',
              options: [
                { value: 'concrete', label: 'خرسانة' },
                { value: 'epoxy', label: 'إيبوكسي' },
                { value: 'tiles', label: 'بلاط' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true
            },
            {
              id: 'floor_condition',
              text: 'حالة الأرضية',
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
              text: 'هل يوجد تشققات في الأرضية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'load_capacity',
              text: 'قدرة التحمل (كجم/متر مربع) إن وجدت',
              type: 'text',
              requiresPhoto: false
            },
            {
              id: 'has_drainage',
              text: 'هل يوجد تصريف للمياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم الأرضية (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    },
    {
      id: 'access',
      title: 'المداخل والمخارج',
      sections: [
        {
          id: 'loading_doors',
          title: 'أبواب التحميل',
          questions: [
            {
              id: 'has_loading_doors',
              text: 'هل يوجد أبواب تحميل؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'number_of_loading_doors',
              text: 'عدد أبواب التحميل',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_loading_doors',
                value: true
              }
            },
            {
              id: 'door_type',
              text: 'نوع الأبواب',
              type: 'select',
              options: [
                { value: 'roll_up', label: 'رول أب' },
                { value: 'sectional', label: 'قطاعية' },
                { value: 'sliding', label: 'منزلقة' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_loading_doors',
                value: true
              }
            },
            {
              id: 'door_dimensions',
              text: 'أبعاد الأبواب (متر × متر)',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_loading_doors',
                value: true
              }
            },
            {
              id: 'door_condition',
              text: 'حالة الأبواب',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_loading_doors',
                value: true
              }
            },
            {
              id: 'rating',
              text: 'تقييم أبواب التحميل (من 1 إلى 10)',
              type: 'rating',
              conditional: {
                dependsOn: 'has_loading_doors',
                value: true
              }
            }
          ]
        },
        {
          id: 'loading_docks',
          title: 'منصات التحميل',
          questions: [
            {
              id: 'has_loading_docks',
              text: 'هل يوجد منصات تحميل؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'number_of_docks',
              text: 'عدد منصات التحميل',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_loading_docks',
                value: true
              }
            },
            {
              id: 'dock_height',
              text: 'ارتفاع المنصات (متر)',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_loading_docks',
                value: true
              }
            },
            {
              id: 'dock_condition',
              text: 'حالة المنصات',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_loading_docks',
                value: true
              }
            },
            {
              id: 'has_dock_levelers',
              text: 'هل يوجد معادلات منصات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true,
              conditional: {
                dependsOn: 'has_loading_docks',
                value: true
              }
            },
            {
              id: 'rating',
              text: 'تقييم منصات التحميل (من 1 إلى 10)',
              type: 'rating',
              conditional: {
                dependsOn: 'has_loading_docks',
                value: true
              }
            }
          ]
        },
        {
          id: 'vehicle_access',
          title: 'وصول المركبات',
          questions: [
            {
              id: 'truck_access',
              text: 'إمكانية وصول الشاحنات',
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
              id: 'parking_area',
              text: 'مساحة مواقف السيارات',
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
              id: 'maneuvering_space',
              text: 'مساحة المناورة للشاحنات',
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
              id: 'road_condition',
              text: 'حالة الطرق المؤدية',
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
              text: 'تقييم وصول المركبات (من 1 إلى 10)',
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
              id: 'power_capacity',
              text: 'سعة الكهرباء (أمبير)',
              type: 'text',
              requiresPhoto: false
            },
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
              id: 'has_three_phase',
              text: 'هل يوجد كهرباء ثلاثية الطور؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_backup_power',
              text: 'هل يوجد نظام طاقة احتياطي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'lighting_quality',
              text: 'جودة الإضاءة',
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
              id: 'has_water_supply',
              text: 'هل يوجد إمداد مياه؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_drainage',
              text: 'هل يوجد نظام صرف؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_floor_drains',
              text: 'هل يوجد مصارف أرضية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_water_leaks',
              text: 'هل يوجد تسريبات مياه؟',
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
              id: 'has_hvac',
              text: 'هل يوجد نظام تكييف؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'hvac_type',
              text: 'نوع نظام التكييف',
              type: 'select',
              options: [
                { value: 'split', label: 'سبليت' },
                { value: 'central', label: 'مركزي' },
                { value: 'industrial', label: 'صناعي' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_hvac',
                value: true
              }
            },
            {
              id: 'hvac_condition',
              text: 'حالة نظام التكييف',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_hvac',
                value: true
              }
            },
            {
              id: 'has_ventilation',
              text: 'هل يوجد نظام تهوية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'ventilation_type',
              text: 'نوع نظام التهوية',
              type: 'select',
              options: [
                { value: 'natural', label: 'طبيعي' },
                { value: 'mechanical', label: 'ميكانيكي' },
                { value: 'mixed', label: 'مختلط' }
              ],
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_ventilation',
                value: true
              }
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
      id: 'safety',
      title: 'السلامة والأمان',
      sections: [
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
              id: 'has_fire_hose',
              text: 'هل يوجد خراطيم إطفاء؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_emergency_exits',
              text: 'هل يوجد مخارج طوارئ؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_emergency_lighting',
              text: 'هل يوجد إضاءة طوارئ؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم السلامة من الحرائق (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'security',
          title: 'الأمن',
          questions: [
            {
              id: 'has_perimeter_fence',
              text: 'هل يوجد سور محيط؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_security_gate',
              text: 'هل يوجد بوابة أمنية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_cctv',
              text: 'هل يوجد كاميرات مراقبة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_alarm_system',
              text: 'هل يوجد نظام إنذار؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_security_lighting',
              text: 'هل يوجد إضاءة أمنية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم الأمن (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        }
      ]
    }
  ]
};

export const StorageInspectionForm = (props: InspectionFormProps) => {
  return <BaseInspectionForm {...props} propertyTypes={[storagePropertyType]} />;
};