import { CalendarDays, Menu } from 'lucide-react';
import { roleLabels } from './navConfig';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button aria-label="Open navigation" onClick={onMenuClick} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-ink/70 hover:bg-paper lg:hidden"><Menu size={19} /></button>
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{roleLabels[user?.role]} portal</p>
            <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-ink sm:text-xl">{title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-2 text-xs font-medium text-ink/50 sm:flex"><CalendarDays size={15} className="text-brand" />{today}</div>
          <div className="flex items-center gap-2 border-l border-border pl-3 sm:pl-5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-dark ring-2 ring-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden max-w-36 truncate text-sm font-semibold text-ink sm:block">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
