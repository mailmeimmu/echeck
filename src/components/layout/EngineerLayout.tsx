import { motion } from 'framer-motion';
import { EngineerNav } from './EngineerNav';
import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const EngineerLayout = () => {
  const location = useLocation();
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  
  // Listen for URL changes or state changes that indicate inspection form is open
  useEffect(() => {
    // Check if the URL contains a query parameter or hash indicating inspection form
    const searchParams = new URLSearchParams(location.search);
    const isInspectionFormOpen = searchParams.has('inspection') || location.hash === '#inspection';
    
    // Also check for any custom state passed via navigation
    const hasInspectionState = location.state && location.state.showInspectionForm;
    
    setShowInspectionForm(isInspectionFormOpen || hasInspectionState);
    
    // Listen for custom events from the InspectionForm component
    const handleInspectionFormOpen = () => setShowInspectionForm(true);
    const handleInspectionFormClose = () => setShowInspectionForm(false);
    
    window.addEventListener('inspection-form-open', handleInspectionFormOpen);
    window.addEventListener('inspection-form-close', handleInspectionFormClose);
    
    return () => {
      window.removeEventListener('inspection-form-open', handleInspectionFormOpen);
      window.removeEventListener('inspection-form-close', handleInspectionFormClose);
    };
  }, [location]);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-gray-50 pt-12 ${!showInspectionForm ? 'pb-20' : ''}`}
    >
      <div className="max-w-lg mx-auto">
        <Outlet context={{ setShowInspectionForm }} />
      </div>
      {!showInspectionForm && <EngineerNav />}
    </motion.div>
  );
};