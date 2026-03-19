import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Zap,
  AlertCircle,
  StopCircle,
  Wifi,
  Building2,
  TrendingUp,
  Star,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonText } from '@/components/ui/Skeleton';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppStore } from '@/store/appStore';
import { buildSalaryPrompt } from '@/utils/prompts';
import { SalaryResultSchema, type SalaryResult } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Data: Countries, Roles, Tech Stack
// ─────────────────────────────────────────

const COUNTRIES = [
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Brazil', label: '🇧🇷 Brazil' },
  { value: 'Remote / Global', label: '🌍 Remote / Global' },
];

const ROLE_LEVELS = [
  'Junior Frontend Developer',
  'Mid-level Frontend Developer',
  'Senior Frontend Developer',
  'Junior Backend Developer',
  'Mid-level Backend Developer',
  'Senior Backend Developer',
  'Junior Full-Stack Developer',
  'Mid-level Full-Stack Developer',
  'Senior Full-Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Mobile Developer (React Native)',
  'DevOps / Cloud Engineer',
  'Data Engineer',
];

const TECH_OPTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Vue.js',
  'Angular', 'GraphQL', 'PostgreSQL', 'MongoDB', 'AWS', 'GCP', 'Azure',
  'Docker', 'Kubernetes', 'Redis', 'Tailwind CSS', 'Prisma', 'Go',
  'Rust', 'Java', 'Spring Boot', 'Django', 'FastAPI', 'React Native',
  'Flutter', 'Terraform', 'CI/CD', 'Figma', 'Express.js',
];

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function GeminiShimmer() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded-full bg-accent-success animate-pulse" />
        <span className="text-accent-success font-body text-sm font-medium animate-pulse">
          Gemini is researching market data...
        </span>
      </div>
      <SkeletonText lines={3} />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}

interface SalaryBarProps {
  min: number;
  mid: number;
  max: number;
  symbol: string;
  currency: string;
}

function formatSalaryNum(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(1); // for INR in Lakhs
}

function SalaryBar({ min, mid, max, symbol, currency }: SalaryBarProps) {
  // Calculate positions as percentages of the full range
  const range = max - min || 1;
  const midPct = ((mid - min) / range) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between text-xs font-body text-text-secondary mb-1">
        <span>{symbol}{formatSalaryNum(min)}</span>
        <span className="text-accent font-semibold text-sm">{symbol}{formatSalaryNum(mid)} <span className="text-text-secondary font-normal text-xs">median</span></span>
        <span>{symbol}{formatSalaryNum(max)}</span>
      </div>
      {/* Bar track */}
      <div className="relative h-5 rounded-full bg-elevated overflow-hidden border border-border">
        {/* Animated fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--accent-success) 0%, var(--accent) 60%, #8AB4F8 100%)',
            boxShadow: '0 0 12px rgba(79,142,247,0.35)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Median marker */}
        <motion.div
          className="absolute top-0 h-full w-0.5 bg-white/80"
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${midPct}%`, opacity: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <p className="text-xs text-text-secondary font-body text-center">
        Annual salary range · {currency}
      </p>
    </div>
  );
}

interface RemoteScoreProps {
  score: number;
}

function RemoteScore({ score }: RemoteScoreProps) {
  const color =
    score >= 70 ? 'text-accent-success' : score >= 40 ? 'text-accent-warning' : 'text-accent-danger';
  const label =
    score >= 70 ? 'Remote Friendly' : score >= 40 ? 'Hybrid Possible' : 'Mostly On-site';
  const bgColor =
    score >= 70
      ? 'bg-accent-success/10 border-accent-success/30'
      : score >= 40
        ? 'bg-accent-warning/10 border-accent-warning/30'
        : 'bg-accent-danger/10 border-accent-danger/30';

  return (
    <div className={cn('flex items-center gap-3 rounded-xl border p-4', bgColor)}>
      <Wifi size={20} className={color} />
      <div>
        <p className={cn('font-body text-sm font-semibold', color)}>{label}</p>
        <p className="font-body text-xs text-text-secondary">{score}/100 remote score</p>
      </div>
      <div className="ml-auto">
        <motion.span
          className={cn('font-display text-2xl font-bold', color)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}

interface ResultsPanelProps {
  result: SalaryResult;
  role: string;
  country: string;
}

function ResultsPanel({ result, role, country }: ResultsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Salary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-surface p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-text">{role}</h3>
            <p className="font-body text-xs text-text-secondary flex items-center gap-1 mt-0.5">
              <Globe size={11} /> {country}
            </p>
          </div>
          <Badge variant="default">{result.currency}</Badge>
        </div>
        <SalaryBar
          min={result.salaryMin}
          mid={result.salaryMid}
          max={result.salaryMax}
          symbol={result.currencySymbol}
          currency={result.currency}
        />
      </motion.div>

      {/* Remote Score + Market Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RemoteScore score={result.remoteFriendly} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-surface p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-accent" />
            <span className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Market Insight
            </span>
          </div>
          <p className="font-body text-sm text-text leading-relaxed">{result.marketInsight}</p>
        </motion.div>
      </div>

      {/* Top Companies + Top Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-surface p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-accent" />
            <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Top Hiring Companies
            </h3>
          </div>
          <ul className="space-y-2">
            {result.topCompanies.map((company, i) => (
              <motion.li
                key={company}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center gap-2 font-body text-sm text-text"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-elevated text-[10px] font-bold text-text-secondary">
                  {i + 1}
                </span>
                {company}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Top Skills to Add */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-surface p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Star size={14} className="text-accent-warning" />
            <h3 className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Skills to Boost Salary
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {result.topSkills.map((skill, i) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-warning/10 text-[10px] font-bold text-accent-warning">
                  {i + 1}
                </span>
                <span className="inline-flex items-center rounded-full bg-accent/10 border border-accent/20 px-3 py-1 font-body text-xs font-medium text-accent">
                  {skill}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export function SalaryPage() {
  const [roleLevel, setRoleLevel] = useState('');
  const [country, setCountry] = useState('');
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { setApiKeyModalOpen } = useAppStore();

  const { status, streamedText, errorMessage, start, stop, reset } = useGeminiStream({
    onComplete: (fullText) => {
      setParseError(null);
      try {
        const cleaned = fullText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const parsed = SalaryResultSchema.safeParse(JSON.parse(cleaned));
        if (parsed.success) {
          setResult(parsed.data);
        } else {
          setParseError('Gemini returned an unexpected format. Please try again.');
          console.debug('Salary schema parse error:', parsed.error.issues);
        }
      } catch {
        setParseError('Failed to parse Gemini response. Please try again.');
      }
    },
  });

  const isStreaming = status === 'streaming';
  const hasResult = status === 'success' && result !== null;
  const hasError = status === 'error' || parseError !== null;

  const toggleStack = useCallback((tech: string) => {
    setSelectedStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : prev.length < 8 ? [...prev, tech] : prev,
    );
  }, []);

  const canSubmit = roleLevel.trim() !== '' && country.trim() !== '' && selectedStack.length >= 1;

  const handleAnalyze = useCallback(() => {
    if (!canSubmit) return;
    setResult(null);
    setParseError(null);
    start(buildSalaryPrompt({ roleLevel, techStack: selectedStack, country }));
  }, [canSubmit, start, roleLevel, selectedStack, country]);

  const handleReset = useCallback(() => {
    reset();
    setResult(null);
    setParseError(null);
  }, [reset]);

  const selectClass = cn(
    'w-full rounded-xl border bg-elevated px-4 py-3',
    'font-body text-sm text-text',
    'border-border focus:border-border-active focus:ring-1 focus:ring-accent focus:outline-none',
    'transition-colors duration-150 disabled:opacity-50',
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-accent-success" />
          <h1 className="font-display text-2xl font-bold text-text">Salary & Role Intelligence</h1>
        </div>
        <p className="font-body text-sm text-text-secondary">
          Select your target role, tech stack, and country. Gemini will synthesize live market intelligence
          with salary ranges, remote scores, and top hiring companies.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Level */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary">Role Level</label>
          <select
            value={roleLevel}
            onChange={(e) => setRoleLevel(e.target.value)}
            disabled={isStreaming}
            className={selectClass}
          >
            <option value="" disabled>Select a role...</option>
            {ROLE_LEVELS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary">Target Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isStreaming}
            className={selectClass}
          >
            <option value="" disabled>Select a country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tech Stack Multi-select */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
          Tech Stack
          <span className="text-xs text-text-secondary">{selectedStack.length} / 8 selected</span>
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-elevated p-4 min-h-[80px]">
          {TECH_OPTIONS.map((tech) => {
            const isSelected = selectedStack.includes(tech);
            return (
              <button
                key={tech}
                onClick={() => toggleStack(tech)}
                disabled={isStreaming}
                className={cn(
                  'rounded-full border px-3 py-1 font-body text-xs font-medium transition-all duration-150',
                  isSelected
                    ? 'border-accent bg-accent/20 text-accent shadow-[0_0_8px_rgba(79,142,247,0.2)]'
                    : 'border-border bg-surface text-text-secondary hover:border-border-active hover:text-text',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {tech}
              </button>
            );
          })}
        </div>
        {selectedStack.length === 0 && (
          <p className="font-body text-xs text-text-secondary">Select at least 1 technology from your stack.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isStreaming ? (
          <Button variant="danger" onClick={stop} leftIcon={<StopCircle size={16} />}>
            Stop
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={!canSubmit}
            leftIcon={<Zap size={16} />}
          >
            Get Salary Intelligence
          </Button>
        )}
        {(hasResult || hasError) && (
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        )}
        <button
          onClick={() => setApiKeyModalOpen(true)}
          className="ml-auto font-body text-xs text-text-secondary hover:text-accent transition-colors underline underline-offset-2"
        >
          API Key Settings
        </button>
      </div>

      {/* Output */}
      <AnimatePresence mode="wait">
        {isStreaming && (
          <motion.div key="streaming" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GeminiShimmer />
            {streamedText && (
              <div className="mt-3 rounded-xl border border-border bg-surface p-4 max-h-36 overflow-auto">
                <p className="font-mono text-xs text-text-secondary whitespace-pre-wrap break-all">{streamedText}</p>
              </div>
            )}
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-accent-danger/30 bg-accent-danger/10 p-4"
          >
            <AlertCircle size={18} className="text-accent-danger mt-0.5 shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-accent-danger">Analysis failed</p>
              <p className="font-body text-xs text-text-secondary mt-1">
                {parseError ?? errorMessage ?? 'An unexpected error occurred.'}
              </p>
            </div>
          </motion.div>
        )}

        {hasResult && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ResultsPanel result={result} role={roleLevel} country={country} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
