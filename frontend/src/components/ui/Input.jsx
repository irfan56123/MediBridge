import { cn } from '@/lib/utils';

export function Label({ className, children, ...props }) {
  return (
    <label className={cn('block text-sm font-medium text-ink mb-1.5', className)} {...props}>
      {children}
    </label>
  );
}

export const Input = ({ className, error, ...props }) => (
  <input
    className={cn(
      'w-full h-10 px-3 rounded-lg border bg-white text-sm text-ink placeholder:text-ink/40',
      'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors',
      error ? 'border-critical' : 'border-border',
      className
    )}
    {...props}
  />
);

export const Select = ({ className, children, error, ...props }) => (
  <select
    className={cn(
      'w-full h-10 px-3 rounded-lg border bg-white text-sm text-ink',
      'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors',
      error ? 'border-critical' : 'border-border',
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ className, error, ...props }) => (
  <textarea
    className={cn(
      'w-full px-3 py-2 rounded-lg border bg-white text-sm text-ink placeholder:text-ink/40',
      'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors',
      error ? 'border-critical' : 'border-border',
      className
    )}
    {...props}
  />
);

export function FormField({ label, error, children }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="mt-1 text-xs text-critical">{error}</p>}
    </div>
  );
}
