import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Frown } from 'lucide-react';

/**
 * 404 Not Found page for unmatched routes.
 */
export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-8"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-elevated border border-border">
        <Frown size={36} className="text-text-secondary" />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-5xl font-bold text-text">404</h1>
        <p className="font-display text-xl font-semibold text-text-secondary">Page not found</p>
        <p className="font-body text-sm text-text-secondary max-w-xs leading-relaxed">
          This route doesn't exist. Head back to the dashboard to use your AI tools.
        </p>
      </div>

      <Link
        to="/"
        className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-body text-sm font-semibold text-white hover:brightness-110 transition-all shadow-[0_0_20px_var(--accent-glow)]"
      >
        <Home size={16} />
        Back to Dashboard
      </Link>
    </motion.div>
  );
}
