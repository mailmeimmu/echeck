import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const StorageInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="مستودع" />;
};