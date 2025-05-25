import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface InspectionFormProps {
  bookingId: string;
  engineerId: string;
  onSubmit?: () => void;
}

export default function InspectionForm({ bookingId, engineerId, onSubmit }: InspectionFormProps) {
  const [formData, setFormData] = useState({
    property_age: '',
    total_area: '',
    floor_count: '',
    foundation_type: '',
    foundation_condition: 'good',
    wall_condition: 'good',
    roof_condition: 'good',
    property_safe: true,
    notes: ''
  });

  const supabase = useSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('inspections')
        .insert({
          booking_id: bookingId,
          engineer_id: engineerId,
          ...formData,
          property_age: parseInt(formData.property_age),
          total_area: parseFloat(formData.total_area),
          floor_count: parseInt(formData.floor_count)
        });

      if (submitError) throw submitError;

      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditions = ['excellent', 'good', 'fair', 'poor'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="property_age" className="block text-sm font-medium text-gray-700">
            Property Age (years)
          </label>
          <input
            type="number"
            id="property_age"
            name="property_age"
            value={formData.property_age}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="total_area" className="block text-sm font-medium text-gray-700">
            Total Area (sq meters)
          </label>
          <input
            type="number"
            id="total_area"
            name="total_area"
            value={formData.total_area}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="floor_count" className="block text-sm font-medium text-gray-700">
            Number of Floors
          </label>
          <input
            type="number"
            id="floor_count"
            name="floor_count"
            value={formData.floor_count}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="foundation_type" className="block text-sm font-medium text-gray-700">
            Foundation Type
          </label>
          <input
            type="text"
            id="foundation_type"
            name="foundation_type"
            value={formData.foundation_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="foundation_condition" className="block text-sm font-medium text-gray-700">
            Foundation Condition
          </label>
          <select
            id="foundation_condition"
            name="foundation_condition"
            value={formData.foundation_condition}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wall_condition" className="block text-sm font-medium text-gray-700">
            Wall Condition
          </label>
          <select
            id="wall_condition"
            name="wall_condition"
            value={formData.wall_condition}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="roof_condition" className="block text-sm font-medium text-gray-700">
            Roof Condition
          </label>
          <select
            id="roof_condition"
            name="roof_condition"
            value={formData.roof_condition}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="property_safe"
            name="property_safe"
            checked={formData.property_safe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="property_safe" className="ml-2 block text-sm text-gray-700">
            Property is safe for occupancy
          </label>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>
    </form>
  );
}