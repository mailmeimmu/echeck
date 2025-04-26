import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface StatusButtonProps {
  status: string;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  disabled?: boolean;
}

export const StatusButton = ({ status, onApprove, onReject, disabled }: StatusButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      await action();
    } catch (err) {
      console.error('Status action error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث الحالة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>جاري التحديث...</span>
      </Button>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm"
      >
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </motion.div>
    );
  }

  switch (status) {
    case 'pending':
      return (
        <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium text-center">
          قيد المراجعة
        </div>
      );

    case 'open':
      return (
        <div className="flex gap-2">
          <Button
            onClick={() => onApprove?.()}
            disabled={disabled}
            className="flex-1"
          >
            <Check className="w-4 h-4" />
            <span>تعيين مهندس</span>
          </Button>
          <Button
            onClick={() => onReject?.()}
            variant="secondary"
            disabled={disabled}
            className="flex-1"
          >
            <X className="w-4 h-4" />
            <span>رفض</span>
          </Button>
        </div>
      );

    case 'engineer_assigned':
      return (
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium text-center">
          تم تعيين مهندس
        </div>
      );

    case 'in_progress':
      return (
        <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium text-center">
          جاري الفحص
        </div>
      );

    case 'completed':
      return (
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium text-center">
          مكتمل
        </div>
      );

    case 'rejected':
      return (
        <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium text-center">
          مرفوض
        </div>
      );

    default:
      return null;
  }
};