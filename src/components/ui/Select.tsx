import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  containerClassName,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium font-body text-text-secondary uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg bg-elevated text-text font-body text-sm',
            'border border-border px-3 py-2.5 pr-9',
            'transition-colors duration-150',
            'focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error &&
              'border-accent-danger/70 focus:border-accent-danger focus:ring-accent-danger',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron arrow */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {hint && !error && (
        <p className="text-xs text-text-secondary">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-accent-danger">
          {error}
        </p>
      )}
    </div>
  );
}
