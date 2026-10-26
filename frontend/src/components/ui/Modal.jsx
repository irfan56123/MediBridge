import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full rounded-2xl bg-surface shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink/50 hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
