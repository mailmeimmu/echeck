import { BaseInspectionForm, InspectionFormProps, PropertyType } from './BaseInspectionForm';

// تعريف نموذج فحص المكتب
const officePropertyType: PropertyType = {
  id: 'office',
  title: 'مكتب',
  areas: [
    {
      id: 'interior',
      title: 'الداخل',
      sections: [
        {
          id: 'main_office',
          title: 'المكتب الرئيسي',
          questions: [
            {
              id: 'floor_type',
              text: 'نوع الأرضية',
              type: 'select',
              options: [
                { value: 'ceramic', label: 'سيراميك' },
                { value: 'porcelain', label: 'بورسلين' },
                { value: 'marble', label: 'رخام' },
                { value: 'carpet', label: 'سجاد' },
                { value: 'vinyl', label: 'فينيل' },
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
              id: 'ceiling_type',
              text: 'نوع السقف',
              type: 'select',
              options: [
                { value: 'suspended', label: 'معلق' },
                { value: 'gypsum', label: 'جبس' },
                { value: 'concrete', label: 'خرساني' },
                { value: 'other', label: 'أخرى' }
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
              text: 'تقييم المكتب الرئيسي (من 1 إلى 10)',
              type: 'rating'
            }
          ]
        },
        {
          id: 'meeting_rooms',
          title: 'غرف الاجتماعات',
          questions: [
            {
              id: 'has_meeting_rooms',
              text: 'هل يوجد غرف اجتماعات؟',
              type: 'boolean',
              requiresPhoto: true
            },
            {
              id: 'number_of_meeting_rooms',
              text: 'عدد غرف الاجتماعات',
              type: 'text',
              requiresPhoto: false,
              conditional: {
                dependsOn: 'has_meeting_rooms',
                value: true
              }
            },
            {
              id: 'meeting_room_condition',
              text: 'حالة غرف الاجتماعات',
              type: 'select',
              options: [
                { value: 'excellent', label: 'ممتازة' },
                { value: 'good', label: 'جيدة' },
                { value: 'fair', label: 'متوسطة' },
                { value: 'poor', label: 'سيئة' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_meeting_rooms',
                value: true
              }
            },
            {
              id: 'has_av_equipment',
              text: 'هل يوجد معدات سمعية وبصرية؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true,
              conditional: {
                dependsOn: 'has_meeting_rooms',
                value: true
              }
            },
            {
              id: 'rating',
              text: 'تقييم غرف الاجتماعات (من 1 إلى 10)',
              type: 'rating',
              conditional: {
                dependsOn: 'has_meeting_rooms',
                value: true
              }
            }
          ]
        },
        {
          id: 'restrooms',
          title: 'دورات المياه',
          questions: [
            {
              id: 'number_of_restrooms',
              text: 'عدد دورات المياه',
              type: 'text',
              requiresPhoto: false
            },
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
              text: 'تقييم دورات المياه (من 1 إلى 10)',
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
              id: 'has_backup_power',
              text: 'هل يوجد نظام طاقة احتياطي؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_sufficient_outlets',
              text: 'هل المخارج الكهربائية كافية؟',
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
          id: 'network',
          title: 'شبكة الاتصالات',
          questions: [
            {
              id: 'has_network_wiring',
              text: 'هل يوجد تمديدات شبكة؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'network_type',
              text: 'نوع الشبكة',
              type: 'select',
              options: [
                { value: 'cat5', label: 'Cat5' },
                { value: 'cat6', label: 'Cat6' },
                { value: 'fiber', label: 'ألياف بصرية' },
                { value: 'other', label: 'أخرى' }
              ],
              requiresPhoto: true,
              conditional: {
                dependsOn: 'has_network_wiring',
                value: true
              }
            },
            {
              id: 'has_server_room',
              text: 'هل يوجد غرفة خوادم؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'has_telecom_room',
              text: 'هل يوجد غرفة اتصالات؟',
              type: 'boolean',
              requiresPhoto: true,
              requiresNote: true
            },
            {
              id: 'rating',
              text: 'تقييم شبكة الاتصالات (من 1 إلى 10)',
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
                { value: 'vrf', label: 'VRF' },
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
              ],
              requiresPhoto: false
            },
            {
              id: 'has_air_filtration',
              text: 'هل يوجد نظام تنقية هواء؟',
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
              id: 'has_fire_exits',
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
              id: 'has_access_control',
              text: 'هل يوجد نظام تحكم بالدخول؟',
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
              id: 'has_security_guard',
              text: 'هل يوجد حارس أمن؟',
              type: 'boolean',
              requiresPhoto: false,
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

export const OfficeInspectionForm = (props: InspectionFormProps) => {
  return <BaseInspectionForm {...props} propertyTypes={[officePropertyType]} />;
};