import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertCircle, FileText, Download } from 'lucide-react';

export const ReportsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('inspections')
        .select(`
          *,
          booking:bookings(
            location,
            property_type:property_types(name)
          ),
          engineer:engineers(
            profile:profiles!engineers_user_id_fkey(
              first_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('حدث خطأ في تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: any) => {
    // TODO: Implement report download
    console.log('Downloading report:', report.id);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">تقارير الفحص</h2>
        <div className="p-2 bg-emerald-50 rounded-xl">
          <FileText className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-gray-500 p-4">
          لا توجد تقارير
        </p>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold">
                    {report.booking.property_type.name}
                  </h3>
                  <p className="text-gray-500">
                    {report.booking.location}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.property_safe
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {report.property_safe ? 'آمن' : 'غير آمن'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p>المهندس: {report.engineer.profile.first_name}</p>
                <p>التاريخ: {new Date(report.created_at).toLocaleDateString('ar-SA')}</p>
                
                {report.notes && (
                  <p className="text-gray-600 mt-2">{report.notes}</p>
                )}
              </div>

              <Button
                onClick={() => handleDownloadReport(report)}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4" />
                <span>تحميل التقرير</span>
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};