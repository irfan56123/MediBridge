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
          'relative w-full rounded-3xl border border-white/70 bg-surface shadow-2xl shadow-ink/15 max-h-[90vh] overflow-y-auto scrollbar-thin',
          sizes[size]
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/80 bg-white/95 px-6 py-5 backdrop-blur">
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button aria-label="Close dialog" onClick={onClose} className="rounded-xl p-2 text-ink/50 transition-colors hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
