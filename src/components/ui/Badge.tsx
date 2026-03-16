import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'ghost';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// ─────────────────────────────────────────
// Variant Styles Map
// ─────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-elevated text-text-secondary border border-border',
  success:
    'bg-accent-success/10 text-accent-success border border-accent-success/30',
  warning:
    'bg-accent-warning/10 text-accent-warning border border-accent-warning/30',
  danger:
    'bg-accent-danger/10 text-accent-danger border border-accent-danger/30',
  accent:
    'bg-accent/10 text-accent border border-accent/30',
  ghost:
    'bg-transparent text-text-secondary border border-border',
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-body transition-colors',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
