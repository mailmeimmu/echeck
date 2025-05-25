import { StandardInspectionForm, InspectionFormProps } from './StandardInspectionForm';

export const BuildingInspectionForm = (props: Omit<InspectionFormProps, 'propertyType'>) => {
  return <StandardInspectionForm {...props} propertyType="مبنى" />;
};