import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ToastContainer } from '@/components/ui/Toast';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';

// ─────────────────────────────────────────
// Lazy-loaded feature pages (code splitting)
// ─────────────────────────────────────────

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);
const ResumePage = lazy(() =>
  import('@/features/resume/ResumePage').then((m) => ({
    default: m.ResumePage,
  })),
);
const SalaryPage = lazy(() =>
  import('@/features/salary/SalaryPage').then((m) => ({
    default: m.SalaryPage,
  })),
);
const OutreachPage = lazy(() =>
  import('@/features/outreach/OutreachPage').then((m) => ({
    default: m.OutreachPage,
  })),
);
const InterviewPage = lazy(() =>
  import('@/features/interview/InterviewPage').then((m) => ({
    default: m.InterviewPage,
  })),
);
const TrackerPage = lazy(() =>
  import('@/features/tracker/TrackerPage').then((m) => ({
    default: m.TrackerPage,
  })),
);

// ─────────────────────────────────────────
// React Query client
// ─────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// ─────────────────────────────────────────
// Suspense fallback
// ─────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard className="hidden sm:flex" />
    </div>
  );
}

// ─────────────────────────────────────────
// App Shell
// ─────────────────────────────────────────

export default function App() {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const { toasts, addToast, dismissToast } = useToast();

  // expose addToast to appStore for cross-component use
  useState(() => {
    (window as typeof window & { __addToast: typeof addToast }).__addToast = addToast;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full overflow-hidden bg-primary text-text">
        {/* ── Desktop Sidebar ── */}
        <Sidebar collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

        {/* ── Main Content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />

          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname}>
              <Suspense fallback={<PageSkeleton />}>
                <Routes location={location}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/salary" element={<SalaryPage />} />
                  <Route path="/outreach" element={<OutreachPage />} />
                  <Route path="/interview" element={<InterviewPage />} />
                  <Route path="/tracker" element={<TrackerPage />} />
                </Routes>
              </Suspense>
            </PageWrapper>
          </AnimatePresence>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <MobileNav />

        {/* ── Toast Notifications ── */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </QueryClientProvider>
  );
}
