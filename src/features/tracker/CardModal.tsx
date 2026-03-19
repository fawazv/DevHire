import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTrackerStore } from '@/store/trackerStore';
import { KANBAN_COLUMNS } from '@/types';
import type { JobCard, KanbanColumn, Priority } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface CardModalProps {
  /** null = add mode, JobCard = edit mode */
  card: JobCard | null;
  defaultColumn?: KanbanColumn;
  onClose: () => void;
}

type FormState = {
  company: string;
  role: string;
  column: KanbanColumn;
  priority: Priority;
  salaryRange: string;
  link: string;
  notes: string;
  nextAction: string;
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const inputClass = cn(
  'w-full rounded-lg border bg-elevated px-3 py-2',
  'font-body text-sm text-text placeholder:text-text-secondary/40',
  'border-border focus:border-border-active focus:ring-1 focus:ring-accent focus:outline-none',
  'transition-colors duration-150',
);

const labelClass = 'font-body text-xs font-semibold text-text-secondary uppercase tracking-wider';

const PRIORITY_OPTIONS: Priority[] = ['High', 'Medium', 'Low'];

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'border-accent-danger/40 bg-accent-danger/10 text-accent-danger',
  Medium: 'border-accent-warning/40 bg-accent-warning/10 text-accent-warning',
  Low: 'border-border bg-elevated text-text-secondary',
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

/**
 * Modal for adding or editing a job tracker card.
 * Backdrop click closes. Escape key closes.
 */
export function CardModal({ card, defaultColumn = 'Wishlist', onClose }: CardModalProps) {
  const { addCard, updateCard, deleteCard } = useTrackerStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<FormState>({
    company: card?.company ?? '',
    role: card?.role ?? '',
    column: card?.column ?? defaultColumn,
    priority: card?.priority ?? 'Medium',
    salaryRange: card?.salaryRange ?? '',
    link: card?.link ?? '',
    notes: card?.notes ?? '',
    nextAction: card?.nextAction ?? '',
  });

  const [errors, setErrors] = useState<{ company?: string; role?: string }>({});

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.company.trim()) newErrors.company = 'Company name is required';
    if (!form.role.trim()) newErrors.role = 'Role title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(() => {
    if (!validate()) return;
    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      column: form.column,
      priority: form.priority,
      salaryRange: form.salaryRange.trim() || undefined,
      link: form.link.trim() || undefined,
      notes: form.notes.trim() || undefined,
      nextAction: form.nextAction.trim() || undefined,
    };
    if (card) {
      updateCard(card.id, payload);
    } else {
      addCard(payload);
    }
    onClose();
  }, [form, card, addCard, updateCard, onClose]);

  const handleDelete = useCallback(() => {
    if (!card) return;
    deleteCard(card.id);
    onClose();
  }, [card, deleteCard, onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-base font-semibold text-text">
              {card ? 'Edit Application' : 'Add Application'}
            </h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-secondary hover:text-text hover:bg-elevated transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Company *</label>
                <input
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  placeholder="e.g. Stripe"
                  className={cn(inputClass, errors.company && 'border-accent-danger focus:border-accent-danger')}
                />
                {errors.company && <p className="font-body text-xs text-accent-danger">{errors.company}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Role *</label>
                <input
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className={cn(inputClass, errors.role && 'border-accent-danger focus:border-accent-danger')}
                />
                {errors.role && <p className="font-body text-xs text-accent-danger">{errors.role}</p>}
              </div>
            </div>

            {/* Column + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Stage</label>
                <select value={form.column} onChange={(e) => set('column', e.target.value as KanbanColumn)} className={inputClass}>
                  {KANBAN_COLUMNS.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Priority</label>
                <div className="flex gap-1.5">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => set('priority', p)}
                      className={cn(
                        'flex-1 rounded-lg border py-2 font-body text-xs font-semibold transition-all duration-150',
                        form.priority === p ? PRIORITY_STYLES[p] : 'border-border bg-elevated text-text-secondary hover:border-border-active',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Salary + Link */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Salary Range</label>
                <input value={form.salaryRange} onChange={(e) => set('salaryRange', e.target.value)} placeholder="e.g. $120k–$150k" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Job Link</label>
                <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
            </div>

            {/* Next Action */}
            <div className="space-y-1.5">
              <label className={labelClass}>Next Action</label>
              <input value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} placeholder="e.g. Submit take-home project by Friday" className={inputClass} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className={labelClass}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Recruiter name, interview format, referral notes..."
                rows={3}
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            {card ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-accent-danger" />
                  <span className="font-body text-xs text-accent-danger">Delete this card?</span>
                  <button onClick={handleDelete} className="font-body text-xs font-semibold text-accent-danger hover:underline">Yes, delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="font-body text-xs text-text-secondary hover:underline">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg p-2 text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 transition-colors">
                  <Trash2 size={14} />
                  <span className="font-body text-xs">Delete</span>
                </button>
              )
            ) : <div />}

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                {card ? 'Save Changes' : 'Add Card'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
