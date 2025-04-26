import { motion } from 'framer-motion';
import { Package } from '../icons/Package';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';

interface PackageCardProps {
  id: string;
  name: string;
  price: number;
  featuresCount: number;
  description: string;
}

export const PackageCard = ({ id, name, price, featuresCount, description }: PackageCardProps) => {
  const navigate = useNavigate();
  const { setSelectedPackageId } = useBookingStore();

  const handleClick = () => {
    setSelectedPackageId(id);
    navigate('/booking');
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-center mb-4">
        <Package className="w-12 h-12 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-bold text-center mb-2">{name}</h3>
      <p className="text-3xl font-bold text-center text-emerald-600 mb-4">
        {price.toLocaleString()} ريال
      </p>
      <p className="text-gray-600 text-center mb-4">
        {featuresCount} خدمات هندسية
      </p>
      <p className="text-gray-700 text-center">{description}</p>
    </motion.div>
  );
};