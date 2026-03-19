/**
 * Centralized Gemini prompt templates for all AI features.
 * All prompts enforce JSON output and use security delimiters
 * to prevent prompt injection from user input.
 */

// ─────────────────────────────────────────
// Input Sanitization
// ─────────────────────────────────────────

/**
 * Sanitizes user-provided text to prevent prompt injection.
 * Strips HTML tags, limits length, and wraps in delimiters.
 */
export function sanitizeInput(text: string, maxLength = 8000): string {
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/[`"\\]/g, ' ') // Remove characters that could break prompt boundaries
    .trim()
    .slice(0, maxLength);
}

// ─────────────────────────────────────────
// Feature 1: Resume Intelligence
// ─────────────────────────────────────────

export interface ResumeAnalysisSchema {
  score: number;
  missingKeywords: string[];
  improvements: {
    original: string;
    improved: string;
    section: string;
  }[];
  summary: string;
}

/**
 * Builds the Resume Intelligence prompt.
 * Enforces strict JSON output matching ResumeAnalysisSchema.
 */
export function buildResumePrompt(jobDescription: string, resume: string): string {
  const safeJD = sanitizeInput(jobDescription);
  const safeResume = sanitizeInput(resume);

  return `You are an expert ATS (Applicant Tracking System) specialist and senior technical recruiter with 15 years of experience. Your task is to analyze a resume against a job description and provide structured, actionable feedback.

JOB_DESCRIPTION_START
${safeJD}
JOB_DESCRIPTION_END

RESUME_START
${safeResume}
RESUME_END

Analyze the resume against the job description and provide:
1. An ATS match score (0-100) based purely on keyword overlap, skill alignment, and role seniority match
2. A list of important keywords/skills from the job description that are MISSING from the resume (max 12 items, each 1-4 words)
3. Up to 5 weak resume bullet points with significantly improved rewrites. Choose bullets that are vague, lack metrics, or use passive voice. Each improvement must be specific, metric-driven, and action-verb-led.
4. A brief 1-2 sentence summary of the overall match quality and top recommendation.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no explanation outside the JSON.
The JSON must exactly match this schema:
{
  "score": number (0-100),
  "missingKeywords": string[] (max 12),
  "improvements": [
    {
      "original": "the original bullet from the resume",
      "improved": "the rewritten, stronger version",
      "section": "e.g. Experience, Projects, Skills"
    }
  ],
  "summary": "brief 1-2 sentence overall assessment"
}`;
}
