import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Mail,
  MessageSquare,
  Kanban,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Mobile bottom tab bar (visible on sm only)
// ─────────────────────────────────────────

const MOBILE_NAV = [
  { path: '/', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { path: '/resume', label: 'Resume', icon: <FileText size={20} /> },
  { path: '/salary', label: 'Salary', icon: <DollarSign size={20} /> },
  { path: '/outreach', label: 'Outreach', icon: <Mail size={20} /> },
  { path: '/interview', label: 'Interview', icon: <MessageSquare size={20} /> },
  { path: '/tracker', label: 'Tracker', icon: <Kanban size={20} /> },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md pb-safe"
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-body font-medium transition-colors',
              isActive ? 'text-accent' : 'text-text-secondary',
            )
          }
          aria-label={item.label}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
