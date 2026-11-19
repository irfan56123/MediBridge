import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm shadow-brand/15',
  accent: 'bg-accent text-white hover:brightness-95 shadow-sm',
  outline: 'border border-border bg-white text-ink hover:border-brand/30 hover:bg-brand-light/50',
  ghost: 'text-ink hover:bg-brand-light/70',
  danger: 'bg-critical text-white hover:brightness-95',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em] transition-all duration-150',
        'focus-visible:ring-4 focus-visible:ring-brand/15 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
