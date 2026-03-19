import { z } from 'zod';

// ─────────────────────────────────────────
// Resume Intelligence Types & Schemas
// ─────────────────────────────────────────

export const ResumeImprovementSchema = z.object({
  original: z.string(),
  improved: z.string(),
  section: z.string(),
});

export const ResumeAnalysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()).max(12),
  improvements: z.array(ResumeImprovementSchema).max(5),
  summary: z.string(),
});

export type ResumeImprovement = z.infer<typeof ResumeImprovementSchema>;
export type ResumeAnalysisResult = z.infer<typeof ResumeAnalysisResultSchema>;

// ─────────────────────────────────────────
// Global Common Types
// ─────────────────────────────────────────

/** Discriminated union for async state */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
