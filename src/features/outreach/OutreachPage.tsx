import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Linkedin,
  Zap,
  Copy,
  Check,
  AlertCircle,
  StopCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { SkeletonText } from '@/components/ui/Skeleton';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { useAppStore } from '@/store/appStore';
import { buildOutreachPrompt } from '@/utils/prompts';
import { OutreachResultSchema, type OutreachResult } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const MANAGER_TYPES = ['CTO', 'Engineering Manager', 'HR / Recruiter'] as const;
type ManagerType = (typeof MANAGER_TYPES)[number];

const TONE_COLORS: Record<OutreachResult['toneLabel'], string> = {
  Professional: 'bg-accent/10 border-accent/30 text-accent',
  Warm: 'bg-accent-success/10 border-accent-success/30 text-accent-success',
  Bold: 'bg-accent-danger/10 border-accent-danger/30 text-accent-danger',
  Concise: 'bg-accent-warning/10 border-accent-warning/30 text-accent-warning',
  'Story-driven': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
};

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function GeminiShimmer() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded-full bg-accent-warning animate-pulse" />
        <span className="text-accent-warning font-body text-sm font-medium animate-pulse">
          Gemini is crafting your outreach...
        </span>
      </div>
      <SkeletonText lines={5} />
      <SkeletonText lines={3} className="mt-4" />
    </div>
  );
}

interface CopyBlockProps {
  label: string;
  icon: React.ReactNode;
  subject?: string;
  content: string;
  accent?: string;
}

function CopyBlock({ label, icon, subject, content, accent = 'text-accent' }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = subject ? `Subject: ${subject}\n\n${content}` : content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [subject, content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-elevated/40">
        <div className={cn('flex items-center gap-2 font-body text-sm font-semibold', accent)}>
          {icon}
          {label}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 font-body text-xs text-text-secondary hover:text-text hover:border-border-active transition-all duration-150"
        >
          {copied ? (
            <><Check size={12} className="text-accent-success" /> Copied!</>
          ) : (
            <><Copy size={12} /> Copy</>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {subject && (
          <div className="rounded-lg bg-elevated border border-border px-3 py-2">
            <span className="font-body text-xs text-text-secondary">Subject: </span>
            <span className="font-body text-sm text-text font-medium">{subject}</span>
          </div>
        )}
        <pre className="font-body text-sm text-text leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </pre>
      </div>
    </motion.div>
  );
}

interface ResultsPanelProps {
  result: OutreachResult;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function ResultsPanel({ result, onRegenerate, isRegenerating }: ResultsPanelProps) {
  const toneClass = TONE_COLORS[result.toneLabel] ?? 'bg-accent/10 border-accent/30 text-accent';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Tone badge + insight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-accent-warning" />
          <span className="font-body text-xs font-semibold text-text-secondary uppercase tracking-wider">Tone</span>
          <span className={cn('inline-flex items-center rounded-full border px-3 py-0.5 font-body text-xs font-semibold', toneClass)}>
            {result.toneLabel}
          </span>
        </div>
        <p className="font-body text-sm text-text-secondary sm:border-l sm:border-border sm:pl-3">
          {result.toneAnalysis}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          isLoading={isRegenerating}
          leftIcon={<RefreshCw size={13} />}
          className="sm:ml-auto shrink-0"
        >
          Regenerate
        </Button>
      </motion.div>

      {/* Email */}
      <CopyBlock
        label="Email"
        icon={<Mail size={14} />}
        subject={result.emailSubject}
        content={result.emailBody}
        accent="text-accent"
      />

      {/* LinkedIn DM */}
      <CopyBlock
        label="LinkedIn DM"
        icon={<Linkedin size={14} />}
        content={result.linkedinDM}
        accent="text-blue-400"
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

const inputClass = cn(
  'w-full rounded-xl border bg-elevated px-4 py-3',
  'font-body text-sm text-text placeholder:text-text-secondary/40',
  'border-border focus:border-border-active focus:ring-1 focus:ring-accent focus:outline-none',
  'transition-colors duration-150 disabled:opacity-50',
);

export function OutreachPage() {
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [managerType, setManagerType] = useState<ManagerType>('Engineering Manager');
  const [background, setBackground] = useState('');
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const lastPromptRef = useRef<string>('');
  const { setApiKeyModalOpen } = useAppStore();

  const parseResult = useCallback((fullText: string) => {
    setParseError(null);
    try {
      const cleaned = fullText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsed = OutreachResultSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) {
        setResult(parsed.data);
      } else {
        setParseError('Gemini returned an unexpected format. Please try again.');
      }
    } catch {
      setParseError('Failed to parse Gemini response. Please try again.');
    }
  }, []);

  const { status, errorMessage, start, stop, reset } = useGeminiStream({
    onComplete: parseResult,
  });

  const isStreaming = status === 'streaming';
  const hasResult = status === 'success' && result !== null;
  const hasError = status === 'error' || parseError !== null;

  const buildAndStart = useCallback(
    (params: { companyName: string; roleTitle: string; managerType: ManagerType; background: string }) => {
      const prompt = buildOutreachPrompt({
        companyName: params.companyName,
        roleTitle: params.roleTitle,
        managerType: params.managerType,
        background: params.background,
      });
      lastPromptRef.current = prompt;
      setResult(null);
      setParseError(null);
      start(prompt);
    },
    [start],
  );

  const handleGenerate = useCallback(() => {
    buildAndStart({ companyName, roleTitle, managerType, background });
  }, [buildAndStart, companyName, roleTitle, managerType, background]);

  const handleRegenerate = useCallback(() => {
    if (!lastPromptRef.current) return;
    setResult(null);
    setParseError(null);
    start(lastPromptRef.current);
  }, [start]);

  const handleReset = useCallback(() => {
    reset();
    setResult(null);
    setParseError(null);
  }, [reset]);

  const canSubmit =
    companyName.trim().length > 1 &&
    roleTitle.trim().length > 1 &&
    background.trim().length > 20;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Mail size={20} className="text-accent-warning" />
          <h1 className="font-display text-2xl font-bold text-text">Cold Outreach Generator</h1>
        </div>
        <p className="font-body text-sm text-text-secondary">
          Fill in the details below. Gemini will generate a personalized cold email and LinkedIn DM, 
          tailored to your recipient type and background.
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Stripe, Vercel, Shopify"
            disabled={isStreaming}
            className={inputClass}
          />
        </div>

        {/* Role Title */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-text-secondary">Role Title</label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={isStreaming}
            className={inputClass}
          />
        </div>
      </div>

      {/* Manager Type */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-sm font-medium text-text-secondary">Who are you reaching out to?</label>
        <div className="flex flex-wrap gap-2">
          {MANAGER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setManagerType(type)}
              disabled={isStreaming}
              className={cn(
                'rounded-full border px-4 py-2 font-body text-sm font-medium transition-all duration-150',
                managerType === type
                  ? 'border-accent bg-accent/20 text-accent shadow-[0_0_12px_rgba(79,142,247,0.2)]'
                  : 'border-border bg-elevated text-text-secondary hover:border-border-active hover:text-text',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Background Summary */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-sm font-medium text-text-secondary flex items-center justify-between">
          Your 3-Line Background Summary
          <span className={cn('text-xs', background.length < 20 ? 'text-accent-warning' : 'text-text-secondary')}>
            {background.length} / 600
          </span>
        </label>
        <textarea
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder={`e.g. Self-taught developer with 2 years building React apps. Built a SaaS tool with 500+ users. Passionate about DX and developer tooling.`}
          maxLength={600}
          rows={4}
          disabled={isStreaming}
          className={cn(inputClass, 'resize-none')}
        />
        <p className="font-body text-xs text-text-secondary">
          Be specific — mention a project, a metric, or a genuine reason you want to work there.
        </p>
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
            onClick={handleGenerate}
            disabled={!canSubmit}
            leftIcon={<Zap size={16} />}
          >
            Generate Outreach
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

      {!canSubmit && status === 'idle' && (
        <p className="font-body text-xs text-text-secondary -mt-3">
          Fill in company, role, and at least 20 characters of background to generate.
        </p>
      )}

      {/* Output */}
      <AnimatePresence mode="wait">
        {isStreaming && (
          <motion.div key="streaming" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GeminiShimmer />
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
              <p className="font-body text-sm font-medium text-accent-danger">Generation failed</p>
              <p className="font-body text-xs text-text-secondary mt-1">
                {parseError ?? errorMessage ?? 'An unexpected error occurred.'}
              </p>
            </div>
          </motion.div>
        )}

        {hasResult && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ResultsPanel
              result={result}
              onRegenerate={handleRegenerate}
              isRegenerating={isStreaming}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
