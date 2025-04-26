import { motion } from 'framer-motion';
import { BookingForm } from '../../components/admin/BookingForm';
import { BookingsList } from '../../components/admin/BookingsList';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Plus, List, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminBookings = () => {
  const [showForm, setShowForm] = useState(false);
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm py-4 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">إدارة الحجوزات</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? (
                <>
                  <List className="w-4 h-4" />
                  <span>عرض الحجوزات</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>حجز جديد</span>
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {showForm ? <BookingForm /> : <BookingsList />}
        </motion.div>
      </div>
    </div>
  );
};