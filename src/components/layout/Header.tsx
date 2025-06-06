import { motion } from 'framer-motion';
import { Package, LogOut, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header = () => {
  const { user, signOut } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-emerald-600">
          <Package className="w-6 h-6" />
          <span className="text-xl font-bold">شيك</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4" />
                  <span>{user.first_name}</span>
                </Button>
              </Link>
              
              <Button 
                variant="secondary" 
                size="sm"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="sm">
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
};