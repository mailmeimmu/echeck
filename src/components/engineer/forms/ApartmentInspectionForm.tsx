import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const ApartmentInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="شقة" />;
};