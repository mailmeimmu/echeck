import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookingsList } from '../../components/admin/BookingsList';
import EngineerRequests from '../../components/admin/EngineerRequests';
import { EngineerList } from '../../components/admin/EngineerList';
import { ReportsList } from '../../components/admin/ReportsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { ClipboardList, Users, FileText } from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="bookings">
              <ClipboardList className="w-4 h-4 ml-2" />
              <span>الحجوزات</span>
            </TabsTrigger>
            <TabsTrigger value="engineers">
              <Users className="w-4 h-4 ml-2" />
              <span>المهندسين</span>
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 ml-2" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsList />
          </TabsContent>

          <TabsContent value="engineers">
            <div className="space-y-6">
              <EngineerRequests />
              <EngineerList />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportsList />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}