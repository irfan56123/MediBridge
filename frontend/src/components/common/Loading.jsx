import { InboxIcon } from 'lucide-react';

export function Spinner({ className = 'h-6 w-6' }) {
  return (
    <svg className={`animate-spin text-brand ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', description, icon: Icon = InboxIcon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-paper p-4 text-ink/30">
        <Icon size={32} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink/50">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
