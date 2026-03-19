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
import { ApiKeyManager } from '@/components/features/ApiKeyManager';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
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
const NotFoundPage = lazy(() =>
  import('@/features/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
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
// Typed route config for ErrorBoundary names
// ─────────────────────────────────────────

const ROUTES = [
  { path: '/',          element: <DashboardPage />,  name: 'Dashboard' },
  { path: '/resume',    element: <ResumePage />,      name: 'Resume Intelligence' },
  { path: '/salary',    element: <SalaryPage />,      name: 'Salary Intelligence' },
  { path: '/outreach',  element: <OutreachPage />,    name: 'Cold Outreach' },
  { path: '/interview', element: <InterviewPage />,   name: 'Interview Prep' },
  { path: '/tracker',   element: <TrackerPage />,     name: 'Job Tracker' },
] as const;

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
            <Routes location={location} key={location.pathname}>
              {ROUTES.map(({ path, element, name }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <PageWrapper>
                      <Suspense fallback={<PageSkeleton />}>
                        <ErrorBoundary featureName={name}>
                          {element}
                        </ErrorBoundary>
                      </Suspense>
                    </PageWrapper>
                  }
                />
              ))}
              {/* 404 catch-all */}
              <Route
                path="*"
                element={
                  <PageWrapper>
                    <Suspense fallback={<PageSkeleton />}>
                      <ErrorBoundary featureName="Page">
                        <NotFoundPage />
                      </ErrorBoundary>
                    </Suspense>
                  </PageWrapper>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <MobileNav />

        {/* ── Toast Notifications ── */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* ── Global Modals ── */}
        <ApiKeyManager />
      </div>
    </QueryClientProvider>
  );
}
