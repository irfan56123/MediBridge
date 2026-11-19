import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, tone = 'brand', sub }) {
  const toneStyles = {
    brand: 'bg-brand-light text-brand-dark ring-1 ring-brand/10',
    accent: 'bg-accent-light text-accent ring-1 ring-accent/10',
    stable: 'bg-stable-light text-stable ring-1 ring-stable/10',
    caution: 'bg-caution-light text-caution ring-1 ring-caution/10',
    critical: 'bg-critical-light text-critical ring-1 ring-critical/10',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 surface-shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[3rem] bg-brand/[0.025] transition-transform group-hover:scale-125" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
          {sub && <p className="mt-2 text-xs font-medium text-ink/50">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('relative rounded-2xl p-3', toneStyles[tone])}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
