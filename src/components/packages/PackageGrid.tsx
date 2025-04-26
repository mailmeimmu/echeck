import { motion } from 'framer-motion';
import { Package, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface PackageGridProps {
  packages: Array<{
    id: string;
    name: string;
    price: number;
    features_count: number;
    description: string;
  }>;
  onSelect: (pkg: any) => void;
}

export const PackageGrid = ({ packages, onSelect }: PackageGridProps) => (
  <div className="grid md:grid-cols-3 gap-8 mb-24">
    {packages.map((pkg, index) => (
      <motion.div
        key={pkg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative group"
      >
        <div className="absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-emerald-50 to-transparent rounded-t-3xl" />
        
        <div className="relative">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <Package className="w-10 h-10 text-emerald-600" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-2">{pkg.name}</h3>
          
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-emerald-600">
              {pkg.price.toLocaleString()}
            </span>
            <span className="text-gray-600"> ريال</span>
          </div>

          <div className="space-y-3 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-1 bg-emerald-50 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-600">خدمة فحص متخصصة</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => onSelect(pkg)}
            className="w-full group"
          >
            <span>اختيار الباقة</span>
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
);