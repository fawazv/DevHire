import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// ATS Score Ring Component
// ─────────────────────────────────────────

interface AtsScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'; // success green
  if (score >= 50) return '#F59E0B'; // warning amber
  return '#EF4444'; // danger red
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Partial Match';
  return 'Weak Match';
}

/**
 * Animated SVG circular progress ring showing the ATS match score.
 * Animates from 0 to the target score on mount.
 */
export function AtsScoreRing({ score, size = 140, strokeWidth = 10, className }: AtsScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Animated foreground ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
          />
        </svg>
        {/* Score text centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <span className="font-body text-sm font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
