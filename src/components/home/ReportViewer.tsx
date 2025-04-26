import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Download, X, CheckCircle, XCircle, Camera, FileCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportViewerProps {
  bookingId: string;
  onClose: () => void;
}

interface InspectionReport {
  id: string;
  created_at: string;
  engineer_id: string;
  property_age: number;
  total_area: number;
  floor_count: number;
  foundation_type: string;
  foundation_condition: string;
  wall_condition: string;
  roof_condition: string;
  property_safe: boolean;
  notes: string;
  engineer_name?: string;
  photos?: Record<string, string[]>;
}

interface ImageViewerProps {
  images: string[];
  title: string;
  onClose: () => void;
}

const ImageViewer = ({ images, title, onClose }: ImageViewerProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl p-6 max-w-2xl w-full"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={url} 
              alt={`صورة ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

export const ReportViewer = ({ bookingId, onClose }: ReportViewerProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<{ title: string; images: string[] } | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data: inspections, error: inspectionError } = await supabase
          .from('inspections')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (inspectionError) throw inspectionError;
        if (!inspections) {
          setError('لم يتم العثور على تقرير لهذا الحجز');
          setLoading(false);
          return;
        }

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', inspections.engineer_id)
          .maybeSingle();

        if (profileError && !profileError.message.includes('no rows found')) {
          throw profileError;
        }

        const { data: photos, error: photosError } = await supabase
          .from('inspection_photos')
          .select('url, section')
          .eq('inspection_id', inspections.id);

        if (photosError) throw photosError;

        const organizedPhotos = (photos || []).reduce((acc: any, photo) => {
          if (!acc[photo.section]) {
            acc[photo.section] = [];
          }
          acc[photo.section].push(photo.url);
          return acc;
        }, {});

        setReport({
          ...inspections,
          engineer_name: profiles?.first_name || 'مهندس',
          photos: organizedPhotos
        });
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('حدث خطأ في تحميل التقرير');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [bookingId]);

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Add logo and header
      pdf.addImage('/check-icon.svg', 'SVG', margin, margin, 20, 20);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('تقرير فحص عقار', pdfWidth / 2, margin + 15, { align: 'center' });

      // Pre-load all images to ensure they're in the browser cache
      if (report?.photos) {
        await Promise.all(
          Object.values(report.photos)
            .flat()
            .map(url => new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = resolve;
              img.onerror = resolve; // Don't fail if an image fails to load
              img.src = `${url}?t=${Date.now()}`; // Add cache buster
            }))
        );
      }

      // Capture the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Pre-process cloned document to handle images
          const images = clonedDoc.getElementsByTagName('img');
          for (let img of images) {
            img.crossOrigin = 'anonymous';
            // Add timestamp to bypass cache
            if (img.src.includes('supabase.co')) {
              img.src = `${img.src}?t=${Date.now()}`;
            }
          }
        }
      });

      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      let position = margin + 30;

      // Add report content
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        margin,
        position,
        contentWidth,
        contentHeight
      );

      // Add photos if available
      if (report?.photos) {
        await Promise.all(Object.entries(report.photos).map(async ([section, urls]) => {
          if (urls.length > 0) {
            if (position + contentHeight > pdfHeight - margin) {
              pdf.addPage();
              position = margin;
            }

            pdf.setFontSize(14);
            pdf.text(getConditionTitle(section), margin, position + 10);
            position += 20;

            const photoWidth = (pdfWidth - (margin * 3)) / 2;
            const photoHeight = photoWidth * 0.75;

            // Load and process images sequentially
            for (let i = 0; i < urls.length; i++) {
              const url = urls[i];
              try {
                // Create a new image and wait for it to load
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = () => {
                    console.warn(`Failed to load image: ${url}`);
                    resolve(); // Don't reject, just continue
                  };
                  img.src = `${url}?t=${Date.now()}`; // Add timestamp to bypass cache
                });

                const x = margin + (i % 2) * (photoWidth + margin);
                const y = position + Math.floor(i / 2) * (photoHeight + margin);

                pdf.addImage(img, 'JPEG', x, y, photoWidth, photoHeight);
              } catch (imgError) {
                console.warn(`Failed to add image to PDF: ${url}`, imgError);
                // Continue with other images if one fails
                continue;
              }
            }

            position += Math.ceil(urls.length / 2) * (photoHeight + margin);
          }
        }));
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(128);
      const today = new Date().toLocaleDateString('ar-SA');
      pdf.text(`تم إنشاء هذا التقرير بتاريخ ${today}`, pdfWidth / 2, pdfHeight - margin, {
        align: 'center'
      });

      // Save the PDF
      pdf.save(`تقرير-فحص-عقار-${today}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى لاحقاً');
    } finally {
      setExportingPdf(false);
    }
  };

  const getConditionTitle = (condition: string) => {
    switch (condition) {
      case 'foundation_condition': return 'الأساسات';
      case 'wall_condition': return 'الجدران';
      case 'roof_condition': return 'السقف';
      default: return '';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onClose} variant="outline">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">لم يتم العثور على تقرير</p>
        <Button onClick={onClose} variant="outline">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 print:shadow-none print:p-0"
      >
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button onClick={onClose} variant="outline">
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </Button>

          <div className="flex gap-2">
            <Button 
              onClick={exportToPDF} 
              variant="primary"
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>تحميل PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div ref={reportRef} className="max-w-3xl mx-auto space-y-8">
          {/* Report Header with Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src="/check-icon.svg" alt="شيك" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold">تقرير فحص عقار</h1>
              <p className="text-gray-600">منصة فحص العقارات الأولى في المملكة</p>
            </div>
          </div>

          {/* Report Info */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl print:border-2 print:bg-white">
            <div>
              <p className="text-gray-600">رقم التقرير:</p>
              <p className="font-bold">{report.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-gray-600">تاريخ الفحص:</p>
              <p className="font-bold">{new Date(report.created_at).toLocaleDateString('ar-SA')}</p>
            </div>
            <div>
              <p className="text-gray-600">المهندس:</p>
              <p className="font-bold">{report.engineer_name}</p>
            </div>
            <div>
              <p className="text-gray-600">حالة التقرير:</p>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-600">مكتمل</span>
              </div>
            </div>
          </div>

          {/* Inspection Result */}
          <div className={`p-6 rounded-xl text-center ${
            report.property_safe ? 'bg-emerald-50 print:bg-white print:border-2 print:border-emerald-500' : 'bg-red-50 print:bg-white print:border-2 print:border-red-500'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              {report.property_safe ? (
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h2 className="text-2xl font-bold">نتيجة الفحص</h2>
            </div>
            <div className={`text-xl font-bold ${
              report.property_safe ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {report.property_safe ? 'العقار آمن وصالح للسكن' : 'العقار غير آمن ويحتاج إلى صيانة'}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-xl print:bg-white print:border">
              <h3 className="font-semibold mb-2">عمر العقار</h3>
              <p>{report.property_age} سنة</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl print:bg-white print:border">
              <h3 className="font-semibold mb-2">المساحة الكلية</h3>
              <p>{report.total_area} متر مربع</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl print:bg-white print:border">
              <h3 className="font-semibold mb-2">عدد الطوابق</h3>
              <p>{report.floor_count} طابق</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl print:bg-white print:border">
              <h3 className="font-semibold mb-2">نوع الأساسات</h3>
              <p>{report.foundation_type}</p>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">حالة العناصر الإنشائية</h3>
            <div className="grid md:grid-cols-3 gap-4 print:grid-cols-3">
              {['foundation_condition', 'wall_condition', 'roof_condition'].map((condition) => (
                <div key={condition} className="p-4 bg-gray-50 rounded-xl print:bg-white print:border">
                  <h4 className="font-semibold mb-2">{getConditionTitle(condition)}</h4>
                  <p>{report[condition as keyof typeof report]}</p>
                  {report.photos?.[condition] && (
                    <button
                      onClick={() => setSelectedPhotos({
                        title: getConditionTitle(condition),
                        images: report.photos![condition]
                      })}
                      className="mt-3 w-full p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 print:hidden"
                    >
                      <Camera className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-600">
                        عرض الصور ({report.photos[condition].length})
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="p-6 bg-gray-50 rounded-xl print:bg-white print:border">
              <h3 className="font-semibold mb-2">ملاحظات</h3>
              <p>{report.notes}</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPhotos && (
          <ImageViewer
            images={selectedPhotos.images}
            title={selectedPhotos.title}
            onClose={() => setSelectedPhotos(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};