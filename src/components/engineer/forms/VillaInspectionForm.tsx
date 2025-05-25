import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const VillaInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="فيلا" />;
};