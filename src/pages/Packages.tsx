import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePackageStore } from '../store/packageStore';
import { PackageExplorer } from '../components/packages/PackageExplorer';
import { PackageModal } from '../components/packages/PackageModal';
import { PackageFAQ } from '../components/packages/PackageFAQ';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const PackagesPage = () => {
  const { packages, loading, selectedPackage, fetchPackages, setSelectedPackage } = usePackageStore();

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen">
      <PackageExplorer />
      <PackageFAQ />

      {selectedPackage && (
        <PackageModal
          {...selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
};