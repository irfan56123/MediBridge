import { NavLink } from "react-router-dom";
import { HeartPulse, LogOut } from "lucide-react";
import { navConfig, roleLabels } from "./navConfig";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = navConfig[user?.role] || [];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="rounded-lg bg-brand p-1.5 text-white">
          <HeartPulse size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-semibold text-ink">
          MediBridge
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${user?.role}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink/70 hover:bg-paper hover:text-ink",
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="h-9 w-9 shrink-0 rounded-full bg-brand-light flex items-center justify-center font-display font-semibold text-brand-dark">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.name}
            </p>
            <p className="truncate text-xs text-ink/50">
              {roleLabels[user?.role]}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-critical-light hover:text-critical transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
