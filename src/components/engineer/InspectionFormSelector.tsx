import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Home, Map, Warehouse, FileText, Building2 } from 'lucide-react';
import InspectionForm from './InspectionForm';

interface InspectionFormSelectorProps {
  bookingId: string;
  onComplete?: () => void;
}

export const InspectionFormSelector = ({ bookingId, onComplete = () => {} }: InspectionFormSelectorProps) => {
  // Force scroll to top when the form opens
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Prevent body scrolling when form is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scrolling when form closes
      document.body.style.overflow = 'auto';
    };
  }, []);

  return <InspectionForm bookingId={bookingId} onComplete={onComplete} />;
}
