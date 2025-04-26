import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { initializeGoogleMaps, isGoogleMapsLoaded } from '../../utils/mapLoader';

interface LocationMapProps {
  value: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
  readOnly?: boolean;
}

export const LocationMap = ({ value, onChange, readOnly = false }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupMap = async () => {
      try {
        await initializeGoogleMaps();

        if (mapRef.current) {
          // Create map instance
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: value,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // Create marker
          const markerInstance = new google.maps.Marker({
            position: value,
            map: mapInstance,
            draggable: !readOnly,
            animation: google.maps.Animation.DROP
          });

          // Add click listener if not readonly
          if (!readOnly) {
            mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
              if (e.latLng) {
                markerInstance.setPosition(e.latLng);
                onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }
            });

            // Add drag end listener
            markerInstance.addListener('dragend', () => {
              const position = markerInstance.getPosition();
              if (position) {
                onChange({ lat: position.lat(), lng: position.lng() });
              }
            });
          }

          setMap(mapInstance);
          setMarker(markerInstance);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('حدث خطأ في تحميل الخريطة');
        setLoading(false);
      }
    };

    setupMap();

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, []);

  // Handle opening in Google Maps for engineers
  const handleOpenInGoogleMaps = () => {
    if (readOnly && value) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${value.lat},${value.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] w-full rounded-xl bg-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12"
        >
          <MapPin className="w-full h-full text-emerald-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full rounded-xl bg-red-50 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div 
        ref={mapRef} 
        className={`h-[400px] w-full rounded-xl overflow-hidden shadow-md ${
          readOnly ? 'cursor-pointer' : ''
        }`}
        onClick={handleOpenInGoogleMaps}
      />
      {readOnly && (
        <button
          onClick={handleOpenInGoogleMaps}
          className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
        >
          <MapPin className="w-4 h-4" />
          <span>فتح في خرائط جوجل للملاحة</span>
        </button>
      )}
    </div>
  );
};