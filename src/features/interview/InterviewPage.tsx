import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
  StopCircle,
  Plus,
  HelpCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonText } from '@/components/ui/Skeleton';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppStore } from '@/store/appStore';
import { buildInterviewPrompt, type InterviewStage } from '@/utils/prompts';
import { InterviewResultSchema, type InterviewQuestion } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const TECH_OPTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Vue.js',
  'GraphQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
  'Redis', 'Go', 'Java', 'System Design', 'Data Structures', 'Algorithms',
  'REST APIs', 'CI/CD', 'React Native', 'CSS / HTML', 'Express.js', 'Django',
];

const STAGES: InterviewStage[] = [
  'Phone Screen',
  'Technical Round',
  'System Design',
  'Behavioral',
  'Final Round',
];

const DIFFICULTY_STYLES: Record<InterviewQuestion['difficulty'], string> = {
  Easy: 'bg-accent-success/10 border-accent-success/30 text-accent-success',
  Medium: 'bg-accent-warning/10 border-accent-warning/30 text-accent-warning',
  Hard: 'bg-accent-danger/10 border-accent-danger/30 text-accent-danger',
};

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function GeminiShimmer() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-accent-gemini animate-pulse" />
        <span className="text-accent-gemini font-body text-sm font-medium animate-pulse">
          Gemini is generating questions...
        </span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-2">
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  );
}

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  globalIndex: number;
}

function QuestionCard({ question, index, globalIndex }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-start gap-3 px-4 py-4 hover:bg-elevated/60 transition-colors text-left"
      >
        {/* Question number */}
        <span className="flex h-6 w-6 shrink-0 mt-0.5 items-center justify-center rounded-full bg-accent/10 font-body text-xs font-bold text-accent">
          {globalIndex + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium text-text leading-relaxed">{question.question}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={cn('rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold', DIFFICULTY_STYLES[question.difficulty])}>
            {question.difficulty}
          </span>
          {expanded
            ? <ChevronUp size={14} className="text-text-secondary" />
            : <ChevronDown size={14} className="text-text-secondary" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-4">

              {/* Model Answer */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-accent" />
                  <span className="font-body text-xs font-semibold text-accent uppercase tracking-wider">Model Answer</span>
                </div>
                <p className="font-body text-sm text-text leading-relaxed rounded-lg bg-elevated border border-border px-3 py-3">
                  {question.answer}
                </p>
              </div>

              {/* What they're testing */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-accent-warning" />
                  <span className="font-body text-xs font-semibold text-accent-warning uppercase tracking-wider">What They're Testing</span>
                </div>
                <p className="font-body text-sm text-text-secondary leading-relaxed italic">
                  {question.insight}
                </p>
              </div>

              {/* Follow-up */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-accent-success" />
                  <span className="font-body text-xs font-semibold text-accent-success uppercase tracking-wider">Likely Follow-up</span>
                </div>
                <p className="font-body text-sm text-text rounded-lg border border-accent-success/20 bg-accent-success/5 px-3 py-2">
                  {question.followUp}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export function InterviewPage() {
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [stage, setStage] = useState<InterviewStage>('Technical Round');
  const [experienceYears, setExperienceYears] = useState(1);
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const { setApiKeyModalOpen } = useAppStore();

  const parseAndAppend = useCallback((fullText: string, append: boolean) => {
    setParseError(null);
    try {
      const cleaned = fullText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsed = InterviewResultSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) {
        setAllQuestions((prev) => append ? [...prev, ...parsed.data.questions] : parsed.data.questions);
      } else {
        setParseError('Gemini returned an unexpected format. Please try again.');
      }
    } catch {
      setParseError('Failed to parse Gemini response. Please try again.');
    }
  }, []);

  // We need separate stream instances for initial vs "more" to handle append logic
  const [isAppending, setIsAppending] = useState(false);

  const { status, errorMessage, start, stop, reset } = useGeminiStream({
    onComplete: (fullText) => parseAndAppend(fullText, isAppending),
  });

  const isStreaming = status === 'streaming';
  const hasQuestions = allQuestions.length > 0;
  const hasError = status === 'error' || parseError !== null;

  const toggleStack = useCallback((tech: string) => {
    setSelectedStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : prev.length < 8 ? [...prev, tech] : prev,
    );
  }, []);

  const canSubmit = selectedStack.length >= 1;

  const handleGenerate = useCallback(() => {
    if (!canSubmit) return;
    setIsAppending(false);
    setAllQuestions([]);
    setParseError(null);
    start(buildInterviewPrompt({ techStack: selectedStack, stage, experienceYears }));
  }, [canSubmit, start, selectedStack, stage, experienceYears]);

  const handleGenerateMore = useCallback(() => {
    if (!canSubmit) return;
    setIsAppending(true);
    setParseError(null);
    const previousQuestions = allQuestions.map((q) => q.question);
    start(buildInterviewPrompt({ techStack: selectedStack, stage, experienceYears, previousQuestions }));
  }, [canSubmit, start, selectedStack, stage, experienceYears, allQuestions]);

  const handleReset = useCallback(() => {
    reset();
    setAllQuestions([]);
    setParseError(null);
    setIsAppending(false);
  }, [reset]);

  const tickClass = (val: number) => cn(
    'font-body text-xs font-medium transition-colors',
    experienceYears === val ? 'text-accent' : 'text-text-secondary',
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-accent-gemini" />
          <h1 className="font-display text-2xl font-bold text-text">Interview Prep Coach</h1>
        </div>
        <p className="font-body text-sm text-text-secondary">
          Select your tech stack, interview stage, and experience level. Gemini generates 5 targeted Q&A cards
          you can expand to study model answers, insights, and follow-ups.
        </p>
      </div>

      {/* Interview Stage */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-sm font-medium text-text-secondary">Interview Stage</label>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              disabled={isStreaming}
              className={cn(
                'rounded-full border px-4 py-2 font-body text-sm font-medium transition-all duration-150',
                stage === s
                  ? 'border-accent bg-accent/20 text-accent shadow-[0_0_12px_rgba(79,142,247,0.2)]'
                  : 'border-border bg-elevated text-text-secondary hover:border-border-active hover:text-text',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Slider */}
      <div className="flex flex-col gap-3">
        <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
          Experience Level
          <span className="text-accent font-semibold">
            {experienceYears === 0 ? 'Beginner (< 1 yr)' : `${experienceYears} Year${experienceYears > 1 ? 's' : ''}`}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={experienceYears}
          onChange={(e) => setExperienceYears(Number(e.target.value))}
          disabled={isStreaming}
          className="w-full accent-[var(--accent)] cursor-pointer disabled:opacity-50"
        />
        <div className="flex justify-between">
          {(['< 1yr', '1yr', '2yrs', '3+ yrs'] as const).map((label, i) => (
            <span key={label} className={tickClass(i)}>{label}</span>
          ))}
        </div>
      </div>

      {/* Tech Stack Multi-select */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
          Tech Stack
          <span className="text-xs text-text-secondary">{selectedStack.length} / 8 selected</span>
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-elevated p-4 min-h-[72px]">
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
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-border bg-surface text-text-secondary hover:border-border-active hover:text-text',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {isStreaming ? (
          <Button variant="danger" onClick={stop} leftIcon={<StopCircle size={16} />}>
            Stop
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!canSubmit}
            leftIcon={<Zap size={16} />}
          >
            Generate 5 Questions
          </Button>
        )}
        {hasQuestions && !isStreaming && (
          <Button variant="ghost" onClick={handleGenerateMore} leftIcon={<Plus size={15} />}>
            Generate 5 More
          </Button>
        )}
        {(hasQuestions || hasError) && !isStreaming && (
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
          </motion.div>
        )}

        {hasError && !isStreaming && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-accent-danger/30 bg-accent-danger/10 p-4"
          >
            <AlertCircle size={18} className="text-accent-danger mt-0.5 shrink-0" />
            <div>
              <p className="font-body text-sm font-medium text-accent-danger">Generation failed</p>
              <p className="font-body text-xs text-text-secondary mt-1">
                {parseError ?? errorMessage ?? 'An unexpected error occurred.'}
              </p>
            </div>
          </motion.div>
        )}

        {hasQuestions && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-text-secondary">
                {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''} · click to expand
              </p>
              <div className="flex gap-1">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
                  const count = allQuestions.filter((q) => q.difficulty === d).length;
                  return count > 0 ? (
                    <span key={d} className={cn('rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold', DIFFICULTY_STYLES[d])}>
                      {count} {d}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            {allQuestions.map((q, i) => (
              <QuestionCard key={`${i}-${q.question.slice(0, 20)}`} question={q} index={i} globalIndex={i} />
            ))}
            {isStreaming && (
              <div className="pt-2">
                <GeminiShimmer />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
