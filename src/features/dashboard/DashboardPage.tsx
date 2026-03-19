import {
  Zap,
  FileText,
  DollarSign,
  Mail,
  MessageSquare,
  Kanban,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trophy,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/appStore';
import { useTrackerStore } from '@/store/trackerStore';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Feature card data
// ─────────────────────────────────────────

const FEATURES = [
  {
    to: '/resume',
    icon: <FileText size={20} />,
    label: 'Resume Intelligence',
    description: 'Score ATS match, identify gaps, and rewrite weak bullets.',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    to: '/salary',
    icon: <DollarSign size={20} />,
    label: 'Salary & Role Intel',
    description: 'Understand global market rates for your target role & stack.',
    color: 'text-accent-success',
    bg: 'bg-accent-success/10 border-accent-success/20',
  },
  {
    to: '/outreach',
    icon: <Mail size={20} />,
    label: 'Cold Outreach',
    description: 'Generate hyper-personalized emails & LinkedIn DMs.',
    color: 'text-accent-warning',
    bg: 'bg-accent-warning/10 border-accent-warning/20',
  },
  {
    to: '/interview',
    icon: <MessageSquare size={20} />,
    label: 'Interview Prep',
    description: 'Targeted Q&A coaching for your stack and experience level.',
    color: 'text-accent-gemini',
    bg: 'bg-accent-gemini/10 border-accent-gemini/20',
  },
  {
    to: '/tracker',
    icon: <Kanban size={20} />,
    label: 'Job Tracker',
    description: 'Drag-and-drop Kanban board to manage your applications.',
    color: 'text-accent-danger',
    bg: 'bg-accent-danger/10 border-accent-danger/20',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─────────────────────────────────────────
// Live Tracker Stats Strip
// ─────────────────────────────────────────

function TrackerStatsStrip() {
  const cards = useTrackerStore((s) => s.cards);

  const total = cards.length;
  const applied = cards.filter((c) => c.column === 'Applied').length;
  const interviewing = cards.filter((c) => c.column === 'Interviewing').length;
  const offers = cards.filter((c) => c.column === 'Offer').length;
  const highPriority = cards.filter((c) => c.priority === 'High' && c.column !== 'Rejected' && c.column !== 'Offer').length;

  if (total === 0) return null;

  const stats = [
    { icon: <LayoutDashboard size={14} />, label: 'Tracked', value: total, color: 'text-text-secondary' },
    { icon: <Clock size={14} />, label: 'Applied', value: applied, color: 'text-accent' },
    { icon: <CheckCircle2 size={14} />, label: 'Interviewing', value: interviewing, color: 'text-accent-warning' },
    { icon: <Trophy size={14} />, label: 'Offers', value: offers, color: 'text-accent-success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Job Hunt Progress
        </span>
        <Link to="/tracker" className="font-body text-xs text-accent hover:underline flex items-center gap-1">
          Open Tracker <ArrowRight size={11} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 rounded-lg bg-elevated border border-border p-3">
            <span className={cn('font-display text-xl font-bold', s.color)}>{s.value}</span>
            <div className={cn('flex items-center gap-1 font-body text-[10px] text-text-secondary', s.color)}>
              {s.icon} {s.label}
            </div>
          </div>
        ))}
      </div>
      {highPriority > 0 && (
        <p className="mt-2 font-body text-xs text-accent-warning text-center">
          ⚡ {highPriority} high-priority application{highPriority > 1 ? 's' : ''} need attention
        </p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────

export function DashboardPage() {
  const { hasApiKey, setApiKeyModalOpen } = useAppStore();

  return (
    <div className="flex flex-col gap-7">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-accent text-sm font-medium font-body">
          <Zap size={14} />
          <span>Powered by Gemini 2.0 Flash</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-text">
          Your Job Hunt,{' '}
          <span className="bg-gradient-to-r from-accent to-accent-gemini bg-clip-text text-transparent">
            Supercharged
          </span>
        </h1>
        <p className="text-text-secondary font-body max-w-xl leading-relaxed">
          Stop applying blindly. Use AI-powered tools to match jobs precisely,
          write standout applications, and track every opportunity in one place.
        </p>

        {!hasApiKey && (
          <div className="flex items-center gap-3 mt-1 rounded-xl border border-accent-warning/30 bg-accent-warning/5 p-4">
            <div className="flex-1 text-sm text-accent-warning font-body">
              Add your Gemini API key to unlock all AI features — it's free at ai.google.dev.
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setApiKeyModalOpen(true)}
              rightIcon={<ArrowRight size={14} />}
            >
              Add Key
            </Button>
          </div>
        )}
      </div>

      {/* Live tracker stats (only if cards exist) */}
      <TrackerStatsStrip />

      {/* Feature Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {FEATURES.map((f) => (
          <motion.div key={f.to} variants={itemVariants}>
            <Link to={f.to} className="block group">
              <Card
                animate={false}
                className="h-full border-border hover:border-border-active transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Card.Body className="flex flex-col gap-3">
                  <div
                    className={`inline-flex w-10 h-10 items-center justify-center rounded-lg border ${f.bg} ${f.color}`}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-semibold text-text group-hover:text-accent transition-colors">
                      {f.label}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary font-body leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium mt-auto pt-1 ${f.color}`}
                  >
                    Open tool
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
