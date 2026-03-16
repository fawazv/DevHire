import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  containerClassName?: string;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

// ─────────────────────────────────────────
// Shared base input styles
// ─────────────────────────────────────────

const baseInput = [
  'w-full rounded-lg bg-elevated text-text font-body text-sm',
  'border border-border',
  'placeholder:text-text-secondary/50',
  'transition-colors duration-150',
  'focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

// ─────────────────────────────────────────
// Input
// ─────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftAdornment,
      rightAdornment,
      containerClassName,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium font-body text-text-secondary uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAdornment && (
            <span className="absolute left-3 text-text-secondary">
              {leftAdornment}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInput,
              leftAdornment ? 'pl-9' : 'pl-3',
              rightAdornment ? 'pr-9' : 'pr-3',
              'py-2.5',
              error && 'border-accent-danger/70 focus:border-accent-danger focus:ring-accent-danger',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightAdornment && (
            <span className="absolute right-3 text-text-secondary">
              {rightAdornment}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-text-secondary">{hint}</p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-accent-danger"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─────────────────────────────────────────
// Textarea
// ─────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, containerClassName, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium font-body text-text-secondary uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            baseInput,
            'px-3 py-2.5 resize-y min-h-[120px]',
            error && 'border-accent-danger/70 focus:border-accent-danger focus:ring-accent-danger',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-text-secondary">{hint}</p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-accent-danger"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
