import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface PhotoUploaderProps {
  inspectionId: string;
  section: string;
  onUpload: (url: string) => void;
}

export const PhotoUploader = ({ inspectionId, section, onUpload }: PhotoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Upload to Supabase Storage
      const fileName = `${inspectionId}/${section}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('inspection-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inspection-photos')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-32 flex flex-col items-center justify-center border-dashed"
        disabled={uploading}
      >
        {uploading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Upload className="w-8 h-8 text-emerald-600" />
          </motion.div>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 mb-2 text-emerald-600" />
            <span>اضغط لإضافة صورة</span>
          </>
        )}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 -bottom-8 text-sm text-red-600 text-center"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};