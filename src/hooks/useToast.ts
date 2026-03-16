import { useState, useCallback } from 'react';
import type { ToastData, ToastType } from '@/components/ui/Toast';

/**
 * Generates a unique ID for each toast notification.
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseToastReturn {
  toasts: ToastData[];
  addToast: (
    title: string,
    type?: ToastType,
    description?: string,
    duration?: number,
  ) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Hook to manage a list of toast notifications.
 * Handles auto-dismiss via setTimeout per toast duration.
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      title: string,
      type: ToastType = 'info',
      description?: string,
      duration: number = 4000,
    ) => {
      const id = generateId();
      const toast: ToastData = { id, type, title, description, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [],
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, dismissToast, clearToasts };
}
