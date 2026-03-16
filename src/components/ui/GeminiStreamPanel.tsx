import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface GeminiStreamPanelProps {
  /** Whether the AI is currently generating (animates shimmer) */
  isStreaming: boolean;
  /** Streamed text content to display */
  content: string;
  /** Optional placeholder text when empty and not streaming */
  placeholder?: string;
  className?: string;
}

// ─────────────────────────────────────────
// Shimmer overlaid scroll panel for AI output
// ─────────────────────────────────────────

export function GeminiStreamPanel({
  isStreaming,
  content,
  placeholder = 'AI output will appear here…',
  className,
}: GeminiStreamPanelProps) {
  const isEmpty = content.trim().length === 0;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-elevated min-h-[180px] overflow-hidden',
        className,
      )}
    >
      {/* Animated shimmer overlay while streaming */}
      {isStreaming && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 z-10 overflow-hidden rounded-t-xl"
        >
          <div className="h-full w-full animate-gemini-gradient bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative p-5 overflow-y-auto max-h-[480px]">
        {isEmpty && !isStreaming ? (
          <p className="text-sm text-text-secondary/60 font-mono italic select-none">
            {placeholder}
          </p>
        ) : (
          <pre className="text-sm text-text font-mono leading-relaxed whitespace-pre-wrap break-words">
            {content}
            {/* Blinking cursor while streaming */}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
