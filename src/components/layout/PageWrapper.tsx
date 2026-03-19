import { motion } from 'framer-motion';

// ─────────────────────────────────────────
// Page transition variants
// ─────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface PageWrapperProps {
  children: React.ReactNode;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 overflow-y-auto bg-primary"
    >
      <div className="mx-auto max-w-6xl p-6 pb-24 md:pb-8">
        {children}
      </div>
    </motion.div>
  );
}
