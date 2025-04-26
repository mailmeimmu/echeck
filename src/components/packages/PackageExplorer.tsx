import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface PackageFeature {
  title: string;
  description: string;
}

interface PackageDetails {
  id: string;
  name: string;
  price: number;
  features: PackageFeature[];
  description: string;
}

export const PackageExplorer = () => {
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const navigate = useNavigate();

  const packages: PackageDetails[] = [
    {
      id: 'platinum',
      name: 'الباقة البلاتينية',
      price: 2200,
      description: 'فحص شامل للعقار مع تقرير مفصل وتوصيات متخصصة',
      features: [
        {
          title: 'فحص الأساسات',
          description: 'فحص دقيق لأساسات المبنى وتقييم حالتها'
        },
        {
          title: 'فحص الهيكل الإنشائي',
          description: 'تقييم شامل للهيكل الإنشائي والجدران الحاملة'
        },
        {
          title: 'فحص السباكة',
          description: 'فحص كامل لنظام السباكة وكشف التسربات'
        },
        {
          title: 'فحص الكهرباء',
          description: 'فحص النظام الكهربائي وتقييم السلامة'
        }
      ]
    },
    {
      id: 'gold',
      name: 'الباقة الذهبية',
      price: 1500,
      description: 'فحص متكامل للعقار مع تقرير تفصيلي',
      features: [
        {
          title: 'فحص الأساسات',
          description: 'فحص أساسي لأساسات المبنى'
        },
        {
          title: 'فحص الهيكل الإنشائي',
          description: 'تقييم الهيكل الإنشائي والجدران'
        },
        {
          title: 'فحص السباكة',
          description: 'فحص نظام السباكة الأساسي'
        }
      ]
    },
    {
      id: 'silver',
      name: 'الباقة الفضية',
      price: 800,
      description: 'فحص أساسي للعقار مع تقرير موجز',
      features: [
        {
          title: 'فحص الأساسات',
          description: 'فحص أساسي لأساسات المبنى'
        },
        {
          title: 'فحص الهيكل الإنشائي',
          description: 'تقييم أساسي للهيكل الإنشائي'
        }
      ]
    }
  ];

  const handlePackageSelect = (pkg: PackageDetails) => {
    setSelectedPackage(pkg);
    window.open('https://rekaz.io', '_blank');
  };

  return (
    <div className="py-16 bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">باقات الفحص</h2>
          <p className="text-gray-600">اختر الباقة المناسبة لاحتياجات عقارك</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
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

              <p className="text-gray-600 text-center mb-6">
                {pkg.description}
              </p>

              <div className="space-y-4 mb-8">
                {pkg.features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="p-1 bg-emerald-50 rounded-full mt-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handlePackageSelect(pkg)}
                className="w-full group"
              >
                <span>اختيار الباقة</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};