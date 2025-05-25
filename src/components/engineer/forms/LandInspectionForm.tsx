import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const LandInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="أرض" />;
};