import { create } from 'zustand';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface AppState {
  /** Whether a valid Gemini API key is stored in sessionStorage */
  hasApiKey: boolean;
  /** Controls the API key setup modal */
  isApiKeyModalOpen: boolean;
  /** Whether the sidebar is in collapsed (icon-only) mode */
  isSidebarCollapsed: boolean;

  // ── Actions ──
  setHasApiKey: (value: boolean) => void;
  setApiKeyModalOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

// ─────────────────────────────────────────
// Store
// ─────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  hasApiKey: Boolean(sessionStorage.getItem('dhip_gemini_key')),
  isApiKeyModalOpen: false,
  isSidebarCollapsed: false,

  setHasApiKey: (value) => set({ hasApiKey: value }),
  setApiKeyModalOpen: (open) => set({ isApiKeyModalOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
