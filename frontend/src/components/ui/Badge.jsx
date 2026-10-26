import { cn } from '@/lib/utils';

const styles = {
  neutral: 'bg-paper text-ink/70 border-border',
  brand: 'bg-brand-light text-brand-dark border-brand/20',
  stable: 'bg-stable-light text-stable border-stable/20',
  caution: 'bg-caution-light text-caution border-caution/30',
  critical: 'bg-critical-light text-critical border-critical/20',
  accent: 'bg-accent-light text-accent border-accent/20',
};

// Maps common status strings to a semantic color automatically
const statusMap = {
  pending: 'caution',
  confirmed: 'brand',
  in_progress: 'brand',
  completed: 'stable',
  cancelled: 'critical',
  no_show: 'critical',
  paid: 'stable',
  unpaid: 'critical',
  partial: 'caution',
  refunded: 'neutral',
  available: 'stable',
  occupied: 'critical',
  reserved: 'caution',
  maintenance: 'neutral',
  requested: 'caution',
  sample_collected: 'brand',
  dispensed: 'stable',
};

export default function Badge({ children, variant, status, className }) {
  const resolved = variant || statusMap[status] || 'neutral';
  const label = children ?? (status ? status.replace(/_/g, ' ') : '');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
        styles[resolved],
        className
      )}
    >
      {label}
    </span>
  );
}
