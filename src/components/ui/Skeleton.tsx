import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type SkeletonProps = {
  className?: string;
  /** If true, renders as an inline block instead of block */
  inline?: boolean;
};

export type SkeletonTextProps = {
  lines?: number;
  className?: string;
};

// ─────────────────────────────────────────
// Skeleton Primitive
// ─────────────────────────────────────────

export function Skeleton({ className, inline = false }: SkeletonProps) {
  return (
    <span
      className={cn(
        'animate-pulse rounded-md bg-elevated',
        inline ? 'inline-block' : 'block',
        className,
      )}
    />
  );
}

// ─────────────────────────────────────────
// Skeleton Text Block
// ─────────────────────────────────────────

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 w-full', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5 flex flex-col gap-4',
        className,
      )}
    >
      <Skeleton className="h-5 w-1/2" />
      <SkeletonText lines={3} />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}
