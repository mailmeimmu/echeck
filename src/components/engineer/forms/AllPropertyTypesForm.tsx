import { BaseInspectionForm, InspectionFormProps, PropertyType } from './BaseInspectionForm';

// استيراد جميع أنواع العقارات
import { villaPropertyType } from './propertyTypes/villaType';
import { apartmentPropertyType } from './propertyTypes/apartmentType';
import { landPropertyType } from './propertyTypes/landType';
import { buildingPropertyType } from './propertyTypes/buildingType';
import { officePropertyType } from './propertyTypes/officeType';
import { storagePropertyType } from './propertyTypes/storageType';

// تجميع جميع أنواع العقارات في مصفوفة واحدة
const allPropertyTypes: PropertyType[] = [
  villaPropertyType,
  apartmentPropertyType,
  landPropertyType,
  buildingPropertyType,
  officePropertyType,
  storagePropertyType
];

export const AllPropertyTypesForm = (props: InspectionFormProps) => {
  return <BaseInspectionForm {...props} propertyTypes={allPropertyTypes} />;
};