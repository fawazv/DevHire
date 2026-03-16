import { useLocation } from 'react-router-dom';
import { Key } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from './Sidebar';
import { useAppStore } from '@/store/appStore';

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function TopBar() {
  const location = useLocation();
  const { hasApiKey } = useAppStore();

  const currentNav = NAV_ITEMS.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/80 backdrop-blur-md px-6">
      {/* Page title breadcrumb */}
      <div className="flex flex-col">
        <h2 className="text-base font-display font-semibold text-text leading-tight">
          {currentNav?.label ?? 'DevHire'}
        </h2>
        {currentNav?.description && (
          <p className="text-xs text-text-secondary font-body">
            {currentNav.description}
          </p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* API Key Status indicator */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border',
            hasApiKey
              ? 'bg-accent-success/10 border-accent-success/30 text-accent-success'
              : 'bg-accent-warning/10 border-accent-warning/30 text-accent-warning',
          )}
          aria-label={hasApiKey ? 'Gemini API connected' : 'API key required'}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              hasApiKey ? 'bg-accent-success animate-pulse' : 'bg-accent-warning',
            )}
          />
          {hasApiKey ? 'Gemini Connected' : 'API Key Required'}
        </div>

        {/* API Key settings shortcut */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-elevated hover:text-text transition-colors"
          aria-label="Open API key settings"
          onClick={() => useAppStore.getState().setApiKeyModalOpen(true)}
        >
          <Key size={14} />
        </button>
      </div>
    </header>
  );
}
