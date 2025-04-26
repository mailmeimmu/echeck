import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  description?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  title: string;
}

export const PhotoGallery = ({ photos, title }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!photos.length) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">{title}</h4>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photo.url}
                alt={photo.description || 'صورة الفحص'}
                className="w-full h-full object-cover"
              />
            </div>
            
            <button
              onClick={() => setSelectedPhoto(photo)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <ZoomIn className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedPhoto.url}
              alt={selectedPhoto.description || 'صورة الفحص'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};