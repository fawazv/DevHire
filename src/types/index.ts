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
// Salary & Role Intelligence Types & Schemas
// ─────────────────────────────────────────

export const SalaryResultSchema = z.object({
  salaryMin: z.number(),
  salaryMid: z.number(),
  salaryMax: z.number(),
  currency: z.string(),
  currencySymbol: z.string(),
  remoteFriendly: z.number().min(0).max(100),
  topCompanies: z.array(z.string()).max(5),
  topSkills: z.array(z.string()).max(3),
  marketInsight: z.string(),
});

export type SalaryResult = z.infer<typeof SalaryResultSchema>;

// ─────────────────────────────────────────
// Cold Outreach Generator Types & Schemas
// ─────────────────────────────────────────

export const OutreachResultSchema = z.object({
  emailSubject: z.string(),
  emailBody: z.string(),
  linkedinDM: z.string(),
  toneAnalysis: z.string(),
  toneLabel: z.enum(['Professional', 'Warm', 'Bold', 'Concise', 'Story-driven']),
});

export type OutreachResult = z.infer<typeof OutreachResultSchema>;

// ─────────────────────────────────────────
// Interview Prep Coach Types & Schemas
// ─────────────────────────────────────────

export const InterviewQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  insight: z.string(),
  followUp: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

export const InterviewResultSchema = z.object({
  questions: z.array(InterviewQuestionSchema).min(1).max(5),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewResult = z.infer<typeof InterviewResultSchema>;

// ─────────────────────────────────────────
// Global Common Types
// ─────────────────────────────────────────

/** Discriminated union for async state */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
