import { Search, Bell } from 'lucide-react';
import EcgDivider from './EcgDivider';
import { roleLabels } from './navConfig';
import { useAuth } from '@/context/AuthContext';

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-paper/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-64 rounded-lg border border-border bg-white pl-9 pr-3 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          <button className="relative rounded-lg p-2 text-ink/60 hover:bg-white hover:text-ink transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-stable" />
            <span className="text-xs font-medium text-ink/70">{roleLabels[user?.role]}</span>
          </div>
        </div>
      </div>
      <EcgDivider />
    </header>
  );
}
