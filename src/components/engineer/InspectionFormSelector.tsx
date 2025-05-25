import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import InspectionForm from './InspectionForm';

interface InspectionFormSelectorProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionFormSelector = ({ bookingId, onComplete = () => {} }: InspectionFormSelectorProps) => {
  return <InspectionForm bookingId={bookingId} onComplete={onComplete} />;
}
