import { NavLink } from 'react-router-dom';
import { HeartPulse, LogOut, X } from 'lucide-react';
import { navConfig, roleLabels } from './navConfig';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

function SidebarContent({ user, logout, onNavigate }) {
  const items = navConfig[user?.role] || [];
  const homePath = user?.role === 'lab_technician' ? '/lab' : `/${user?.role}`;
  return (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-black/15">
          <HeartPulse size={21} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block text-[15px] font-bold tracking-tight text-white">MediBridge</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Care, connected</span>
        </div>
      </div>

      <div className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Workspace</div>
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-5">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === homePath}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-150',
              isActive ? 'bg-white text-ink shadow-lg shadow-black/10' : 'text-white/65 hover:bg-white/[0.08] hover:text-white',
            )}>
            <Icon size={18} strokeWidth={2} className="shrink-0 transition-transform group-hover:scale-105" />
          {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-dark ring-2 ring-white/10">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/45">{roleLabels[user?.role]}</p>
          </div>
        </div>
        <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/55 transition-colors hover:bg-critical/20 hover:text-white">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const { user, logout } = useAuth();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[258px] shrink-0 flex-col bg-[#142b3b] text-white lg:flex">
        <SidebarContent user={user} logout={logout} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" onClick={onMobileClose} className="absolute inset-0 bg-[#102334]/55 backdrop-blur-sm" />
          <aside className="relative flex h-full w-[min(84vw,300px)] flex-col bg-[#142b3b] text-white shadow-2xl">
            <button aria-label="Close navigation" onClick={onMobileClose} className="absolute right-3 top-5 z-10 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><X size={19} /></button>
            <SidebarContent user={user} logout={logout} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
