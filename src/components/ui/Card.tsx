import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Animates in with framer motion */
  animate?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────
// Card Root
// ─────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export function Card({ children, className, animate = true }: CardProps) {
  const base = cn(
    'rounded-xl border border-border bg-surface shadow-lg overflow-hidden',
    className,
  );

  if (!animate) {
    return <div className={base}>{children}</div>;
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={base}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Card Sub-components
// ─────────────────────────────────────────

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 pt-5 pb-4 border-b border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('p-5', className)}>{children}</div>
  );
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-5 py-4 border-t border-border bg-elevated/50',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// Attach sub-components via named exports
// ─────────────────────────────────────────

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
