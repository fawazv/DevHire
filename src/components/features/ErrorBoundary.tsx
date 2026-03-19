import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional feature name for a contextual error message */
  featureName?: string;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

/**
 * React Error Boundary wrapping each feature route.
 * Catches rendering errors and displays a graceful recovery UI.
 * Provides a "Try Again" button that resets the error state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd send this to a monitoring service (Sentry, etc.)
    // We deliberately avoid console.error to keep the console clean
    void error;
    void info;
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-danger/10 border border-accent-danger/30">
            <AlertTriangle size={28} className="text-accent-danger" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="font-display text-lg font-semibold text-text">
              {this.props.featureName
                ? `${this.props.featureName} hit an error`
                : 'Something went wrong'}
            </h2>
            <p className="font-body text-sm text-text-secondary leading-relaxed">
              This feature crashed unexpectedly. Your data is safe — try reloading the section.
            </p>
            {this.state.errorMessage && (
              <p className="font-mono text-xs text-accent-danger/70 bg-elevated rounded-lg px-3 py-2 text-left">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-5 py-2.5 font-body text-sm text-text hover:border-border-active hover:text-accent transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
