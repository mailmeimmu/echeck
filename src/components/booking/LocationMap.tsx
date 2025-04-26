import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  value: string;
  onChange: (location: string) => void;
}

const districts = [
  'النرجس',
  'العليا',
  'الملز',
  'النسيم',
  'الروضة',
  'الربوة',
  'السليمانية',
  'الورود',
  'الياسمين',
  'الملقا'
];

export const LocationMap = ({ value, onChange }: LocationMapProps) => {
  const [district, setDistrict] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDistrict(input);

    if (input.length > 0) {
      const filtered = districts.filter(d => 
        d.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectDistrict = (selected: string) => {
    setDistrict(selected);
    setShowSuggestions(false);
    const fullAddress = `${selected}، الرياض`;
    onChange(fullAddress);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={district}
          onChange={handleDistrictChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="ادخل اسم الحي..."
          className="input-field pr-10"
        />
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectDistrict(suggestion)}
                className="w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 rounded-xl flex items-center gap-3"
        >
          <div className="p-2 bg-emerald-100 rounded-xl">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-emerald-800">{value}</p>
            <p className="text-sm text-emerald-600">المملكة العربية السعودية</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};