import { motion } from 'framer-motion';
import { ClipboardList, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const EngineerNav = () => {
  const location = useLocation();
  const { signOut } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: ClipboardList, label: 'الطلبات', path: '/engineer' },
    { icon: User, label: 'الملف الشخصي', path: '/engineer/profile' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg rounded-t-3xl z-50"
    >
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 ${
              isActive(item.path) ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-xl ${
                isActive(item.path) ? 'bg-emerald-50' : ''
              }`}
            >
              <item.icon className="w-6 h-6" />
            </motion.div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl"
          >
            <LogOut className="w-6 h-6" />
          </motion.div>
          <span className="text-xs mt-1">خروج</span>
        </button>
      </div>
    </motion.nav>
  );
};