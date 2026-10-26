import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, tone = 'brand', sub }) {
  const toneStyles = {
    brand: 'bg-brand-light text-brand-dark',
    accent: 'bg-accent-light text-accent',
    stable: 'bg-stable-light text-stable',
    caution: 'bg-caution-light text-caution',
    critical: 'bg-critical-light text-critical',
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink/60">{label}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-xl p-2.5', toneStyles[tone])}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
