import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Mail,
  MessageSquare,
  Kanban,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Navigation items definition
// ─────────────────────────────────────────

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    description: 'Overview & quick actions',
  },
  {
    path: '/resume',
    label: 'Resume AI',
    icon: <FileText size={18} />,
    description: 'ATS scoring & rewrites',
  },
  {
    path: '/salary',
    label: 'Salary Intel',
    icon: <DollarSign size={18} />,
    description: 'Global market rates',
  },
  {
    path: '/outreach',
    label: 'Outreach',
    icon: <Mail size={18} />,
    description: 'Cold email & DM generator',
  },
  {
    path: '/interview',
    label: 'Interview Prep',
    icon: <MessageSquare size={18} />,
    description: 'AI Q&A coaching',
  },
  {
    path: '/tracker',
    label: 'Job Tracker',
    icon: <Kanban size={18} />,
    description: 'Kanban application board',
  },
];

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col flex-shrink-0 h-screen border-r border-border bg-surface overflow-hidden relative z-20"
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <Zap size={16} />
          </span>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm font-display font-bold text-text whitespace-nowrap leading-tight">
              DevHire
            </p>
            <p className="text-[10px] font-body text-text-secondary whitespace-nowrap leading-tight">
              Intelligence Platform
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Collapse Toggle ── */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center rounded-lg p-2 text-text-secondary',
            'hover:bg-elevated hover:text-text transition-colors duration-150',
            collapsed ? 'justify-center' : 'justify-end',
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}

// ─────────────────────────────────────────
// Individual nav link with active pill
// ─────────────────────────────────────────

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
}

function SidebarLink({ item, collapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150',
          isActive
            ? 'text-text'
            : 'text-text-secondary hover:text-text hover:bg-elevated',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Animated active background pill */}
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/20"
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          )}

          {/* Icon */}
          <span
            className={cn(
              'relative z-10 flex-shrink-0 transition-colors',
              isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text',
            )}
          >
            {item.icon}
          </span>

          {/* Label */}
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="relative z-10 overflow-hidden whitespace-nowrap text-sm font-medium font-body"
          >
            {item.label}
          </motion.span>

          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg bg-elevated border border-border text-xs text-text whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl">
              <span className="font-medium">{item.label}</span>
              <span className="block text-[10px] text-text-secondary mt-0.5">
                {item.description}
              </span>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
