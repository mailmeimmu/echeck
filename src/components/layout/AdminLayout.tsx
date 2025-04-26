import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { LogOut, LayoutDashboard, Users, FileText, Home } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

export const AdminLayout = () => {
  const { signOut } = useAuthStore();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'الرئيسية',
      path: '/admin'
    },
    {
      icon: LayoutDashboard,
      label: 'الحجوزات',
      path: '/admin/bookings'
    },
    {
      icon: Users,
      label: 'المهندسين',
      path: '/admin/engineers'
    },
    {
      icon: FileText,
      label: 'التقارير',
      path: '/admin/reports'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm py-4 px-6 fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-600">شيك</span>
            <span className="text-sm text-gray-500">لوحة التحكم</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>

      {/* Side Navigation */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 z-40">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};