import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Camera, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { withRetry } from '../../utils/databaseHelpers';

interface PhotoUploaderProps {
  inspectionId: string;
  section: string;
  photos?: string[];
  onUpload: (url: string) => void;
}

export const PhotoUploader = ({ inspectionId, section, photos = [], onUpload }: PhotoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(photos);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Update uploadedPhotos when photos prop changes
  useEffect(() => {
    setUploadedPhotos(photos);
  }, [photos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('يرجى اختيار صورة صالحة');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      }

          lastError = error;
      // Use withRetry for more reliable uploads
      const data = await withRetry(async () => {
        const fileName = `${inspectionId}/${section}/${Date.now()}-${file.name}`;
        const result = await supabase.storage
          .from('inspection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (result.error) throw result.error;
        return result.data;
      }, 5);
      
      if (!data) throw new Error('فشل تحميل الصورة');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inspection-photos')
        .getPublicUrl(data.path);
      
      setUploadedPhotos(prev => [...prev, publicUrl]);
      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="relative mb-4 sm:mb-6">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      
      {/* Photo upload button */}
      <div className="mb-2 text-xs sm:text-sm font-medium text-gray-700">
        {uploadedPhotos.length > 0 ? 'الصور المرفقة:' : 'إضافة صور:'}
      </div>
      
      {/* Display uploaded photos */}
      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {uploadedPhotos.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-emerald-100">
              <img 
                src={url} 
                alt={`صورة ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Retry loading image with cache busting
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('?')) {
                    target.src = `${url}?t=${Date.now()}`;
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Main upload button */}
      {showOptions ? (
        <div className="grid grid-cols-2 gap-2 mb-1">
          <Button
            type="button"
            variant="outline"
            className="h-14 sm:h-16 flex flex-col items-center justify-center"
            onClick={openCamera}
            disabled={uploading}
          >
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-emerald-600" />
            <span className="text-xs sm:text-sm">التقاط صورة</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="h-14 sm:h-16 flex flex-col items-center justify-center"
            onClick={openFileSelector}
            disabled={uploading}
          >
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-emerald-600" />
            <span className="text-xs sm:text-sm">اختيار من الجهاز</span>
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={`w-full h-12 sm:h-16 flex flex-col items-center justify-center border-dashed ${
            uploadedPhotos.length > 0 ? 'bg-emerald-50 border-emerald-300' : ''
          }`}
          onClick={toggleOptions}
          disabled={uploading}
        >
        {uploading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </motion.div>
        ) : (
          <>
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-emerald-600" />
            <span className="text-xs sm:text-sm">{uploadedPhotos.length > 0 ? 'إضافة المزيد من الصور' : 'اضغط لإضافة صورة'}</span>
          </>
        )}
      </Button>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs sm:text-sm text-red-600 text-center"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};