import { motion } from 'framer-motion';
import { BookingsList } from '../../components/admin/BookingsList';
import { BookingForm } from '../../components/admin/BookingForm';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Plus, List } from 'lucide-react';

export const BookingsPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">إدارة الحجوزات</h1>
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
        </div>

        {showForm ? <BookingForm /> : <BookingsList />}
      </motion.div>
    </div>
  );
};