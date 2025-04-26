import { motion } from 'framer-motion';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, children }: TabsProps) => {
  return (
    <div className="space-y-4" data-value={value}>
      {children}
    </div>
  );
};

export const TabsList = ({ children }: TabsListProps) => {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children }: TabsTriggerProps) => {
  const isActive = value === (document.querySelector('[data-value]')?.getAttribute('data-value') || '');

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const tabs = document.querySelector('[data-value]');
        if (tabs) {
          const currentValue = tabs.getAttribute('data-value');
          if (currentValue !== value) {
            tabs.setAttribute('data-value', value);
            tabs.dispatchEvent(new CustomEvent('valueChange', { detail: value }));
          }
        }
      }}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-white text-emerald-600 shadow-sm'
          : 'text-gray-600 hover:bg-white/50'
      }`}
    >
      {children}
    </motion.button>
  );
};

export const TabsContent = ({ value, children }: TabsContentProps) => {
  const isActive = value === (document.querySelector('[data-value]')?.getAttribute('data-value') || '');

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
};