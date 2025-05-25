import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const OfficeInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="مكتب" />;
};