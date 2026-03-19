import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Zap, Copy, Check, AlertCircle, StopCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonText } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppStore } from '@/store/appStore';
import { buildResumePrompt } from '@/utils/prompts';
import { ResumeAnalysisResultSchema, type ResumeAnalysisResult } from '@/types';
import { AtsScoreRing } from '@/components/features/AtsScoreRing';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function GeminiShimmer() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded-full bg-accent animate-pulse" />
        <span className="text-accent font-body text-sm font-medium animate-pulse">Gemini is analyzing...</span>
      </div>
      <SkeletonText lines={3} />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}

interface ImprovementCardProps {
  improvement: ResumeAnalysisResult['improvements'][number];
  index: number;
}

function ImprovementCard({ improvement, index }: ImprovementCardProps) {
  const [copied, setCopied] = useState<'original' | 'improved' | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = useCallback(async (text: string, type: 'original' | 'improved') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Badge variant="default" className="shrink-0">
            {improvement.section}
          </Badge>
          <span className="text-text-secondary font-body text-xs truncate max-w-xs">
            {improvement.original.slice(0, 60)}...
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-secondary shrink-0" /> : <ChevronDown size={14} className="text-text-secondary shrink-0" />}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Original */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Original
                  </span>
                  <button
                    onClick={() => handleCopy(improvement.original, 'original')}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    {copied === 'original' ? <Check size={12} className="text-accent-success" /> : <Copy size={12} />}
                    {copied === 'original' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-body text-sm text-text-secondary leading-relaxed">{improvement.original}</p>
              </div>

              {/* Improved */}
              <div className="p-4 space-y-2 bg-elevated/30">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold text-accent-success uppercase tracking-wider">
                    ✦ Improved
                  </span>
                  <button
                    onClick={() => handleCopy(improvement.improved, 'improved')}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text transition-colors"
                  >
                    {copied === 'improved' ? <Check size={12} className="text-accent-success" /> : <Copy size={12} />}
                    {copied === 'improved' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-body text-sm text-text leading-relaxed">{improvement.improved}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Results Panel
// ─────────────────────────────────────────

interface ResultsPanelProps {
  result: ResumeAnalysisResult;
}

function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Score + Summary row */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border border-border bg-surface p-6">
        <AtsScoreRing score={result.score} />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h3 className="font-display text-lg font-semibold text-text">Analysis Complete</h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Missing Keywords */}
      {result.missingKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-surface p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-accent-warning" />
            <h3 className="font-display text-base font-semibold text-text">
              Missing Keywords <span className="text-text-secondary font-body font-normal text-sm">({result.missingKeywords.length})</span>
            </h3>
          </div>
          <p className="font-body text-xs text-text-secondary">These keywords appear in the job description but not in your resume.</p>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center rounded-full bg-accent-warning/10 border border-accent-warning/30 px-3 py-1 font-body text-xs font-medium text-accent-warning"
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bullet Improvements */}
      {result.improvements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent" />
            <h3 className="font-display text-base font-semibold text-text">
              Bullet Rewrites <span className="text-text-secondary font-body font-normal text-sm">({result.improvements.length} improvements)</span>
            </h3>
          </div>
          <div className="space-y-3">
            {result.improvements.map((imp, i) => (
              <ImprovementCard key={i} improvement={imp} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

const PLACEHOLDER_JD = `Senior Frontend Engineer

We're looking for a React expert to join our team.

Requirements:
• 4+ years of experience with React and TypeScript
• Experience with state management (Redux, Zustand, or similar)
• Performance optimization (code splitting, memoization, lazy loading)
• REST API integration + GraphQL knowledge
• CI/CD pipelines and Git workflows
• Strong problem-solving and communication skills
• Experience with Tailwind CSS or similar utility frameworks
`;

const PLACEHOLDER_RESUME = `EXPERIENCE
Software Developer | ABC Corp | 2022–Present
• Worked on React projects for various clients
• Fixed bugs and added new features
• Helped with code reviews
• Used JavaScript and CSS for web development

SKILLS
React, JavaScript, HTML, CSS, Git

EDUCATION
B.Sc Computer Science | XYZ University | 2022
`;

export function ResumePage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { setApiKeyModalOpen } = useAppStore();

  const { status, streamedText, errorMessage, start, stop, reset } = useGeminiStream({
    onComplete: (fullText) => {
      setParseError(null);
      try {
        // Gemini sometimes wraps in ```json blocks — strip them
        const cleaned = fullText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const parsed = ResumeAnalysisResultSchema.safeParse(JSON.parse(cleaned));
        if (parsed.success) {
          setResult(parsed.data);
        } else {
          setParseError('Gemini returned an unexpected format. Please try again.');
        }
      } catch {
        setParseError('Failed to parse Gemini response. Please try again.');
      }
    },
  });

  const isStreaming = status === 'streaming';
  const isIdle = status === 'idle';
  const hasResult = status === 'success' && result !== null;
  const hasError = status === 'error' || parseError !== null;

  const handleAnalyze = useCallback(() => {
    if (!jobDescription.trim() || !resume.trim()) return;
    setResult(null);
    setParseError(null);
    const prompt = buildResumePrompt(jobDescription, resume);
    start(prompt);
  }, [jobDescription, resume, start]);

  const handleReset = useCallback(() => {
    reset();
    setResult(null);
    setParseError(null);
  }, [reset]);

  const canSubmit = jobDescription.trim().length > 50 && resume.trim().length > 50;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-accent" />
          <h1 className="font-display text-2xl font-bold text-text">Resume Intelligence</h1>
        </div>
        <p className="font-body text-sm text-text-secondary">
          Paste a job description and your resume. Gemini will score your ATS match, identify missing keywords,
          and rewrite weak bullet points.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Description */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
            Job Description
            <span className={cn('text-xs', jobDescription.length < 50 ? 'text-accent-warning' : 'text-text-secondary')}>
              {jobDescription.length} / 8000 chars
            </span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={PLACEHOLDER_JD}
            maxLength={8000}
            rows={14}
            disabled={isStreaming}
            className={cn(
              'w-full resize-none rounded-xl border bg-elevated px-4 py-3',
              'font-body text-sm text-text placeholder:text-text-secondary/40 leading-relaxed',
              'border-border focus:border-border-active focus:ring-1 focus:ring-accent focus:outline-none',
              'transition-colors duration-150 disabled:opacity-50',
            )}
          />
        </div>

        {/* Resume */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
            Your Resume
            <span className={cn('text-xs', resume.length < 50 ? 'text-accent-warning' : 'text-text-secondary')}>
              {resume.length} / 8000 chars
            </span>
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder={PLACEHOLDER_RESUME}
            maxLength={8000}
            rows={14}
            disabled={isStreaming}
            className={cn(
              'w-full resize-none rounded-xl border bg-elevated px-4 py-3',
              'font-body text-sm text-text placeholder:text-text-secondary/40 leading-relaxed',
              'border-border focus:border-border-active focus:ring-1 focus:ring-accent focus:outline-none',
              'transition-colors duration-150 disabled:opacity-50',
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isStreaming ? (
          <Button variant="danger" onClick={stop} leftIcon={<StopCircle size={16} />}>
            Stop Analysis
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={!canSubmit}
            leftIcon={<Zap size={16} />}
          >
            Analyze with Gemini
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

      {!canSubmit && isIdle && (
        <p className="font-body text-xs text-text-secondary">
          Enter at least 50 characters in both fields to enable analysis.
        </p>
      )}

      {/* Output Section */}
      <AnimatePresence mode="wait">
        {/* Streaming shimmer */}
        {isStreaming && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GeminiShimmer />
            {streamedText && (
              <div className="mt-3 rounded-xl border border-border bg-surface p-4 max-h-48 overflow-auto">
                <p className="font-mono text-xs text-text-secondary whitespace-pre-wrap break-all">
                  {streamedText}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Error state */}
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

        {/* Results */}
        {hasResult && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ResultsPanel result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
