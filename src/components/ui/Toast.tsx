import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

export interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

// ─────────────────────────────────────────
// Icon & Style Maps
// ─────────────────────────────────────────

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; containerClass: string; iconClass: string }
> = {
  success: {
    icon: <CheckCircle size={16} />,
    containerClass: 'border-accent-success/40 bg-accent-success/10',
    iconClass: 'text-accent-success',
  },
  error: {
    icon: <XCircle size={16} />,
    containerClass: 'border-accent-danger/40 bg-accent-danger/10',
    iconClass: 'text-accent-danger',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    containerClass: 'border-accent-warning/40 bg-accent-warning/10',
    iconClass: 'text-accent-warning',
  },
  info: {
    icon: <Info size={16} />,
    containerClass: 'border-border bg-elevated',
    iconClass: 'text-accent',
  },
};

// ─────────────────────────────────────────
// Individual Toast
// ─────────────────────────────────────────

export function Toast({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-xl',
        'backdrop-blur-sm min-w-[300px] max-w-sm',
        config.containerClass,
      )}
      role="alert"
      aria-live="polite"
    >
      <span className={cn('mt-0.5 shrink-0', config.iconClass)}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-text-secondary">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-text-secondary hover:text-text transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Toast Container (renders all toasts)
// ─────────────────────────────────────────

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
