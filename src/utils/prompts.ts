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

// ─────────────────────────────────────────
// Feature 2: Salary & Role Intelligence
// ─────────────────────────────────────────

export interface SalaryPromptParams {
  roleLevel: string;
  techStack: string[];
  country: string;
}

/**
 * Builds the Salary & Role Intelligence prompt.
 * Enforces strict JSON output. All user inputs are sanitized.
 */
export function buildSalaryPrompt({ roleLevel, techStack, country }: SalaryPromptParams): string {
  const safeRole = sanitizeInput(roleLevel, 100);
  const safeStack = techStack.map((t) => sanitizeInput(t, 50)).join(', ');
  const safeCountry = sanitizeInput(country, 100);

  return `You are a global compensation data expert with real-time knowledge of tech hiring markets. Provide accurate, current salary intelligence for a software developer role.

ROLE_QUERY_START
Role Level: ${safeRole}
Tech Stack: ${safeStack}
Target Country/Region: ${safeCountry}
ROLE_QUERY_END

Based on this combination, provide:
1. Annual salary range (min, mid, max) in local currency. For the US use USD, UK use GBP, India use INR (in Lakhs per annum), EU countries use EUR, etc.
2. Remote-friendliness score (0-100): how likely this role+stack combination is to be remote-friendly globally
3. Top 5 companies actively hiring for this role+stack combination in the specified country/region
4. Top 3 additional skills that would significantly boost salary for this profile (be specific, not generic)
5. A 2-3 sentence market insight summarizing demand, trends, or advice for breaking in

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks.
The JSON must exactly match this schema:
{
  "salaryMin": number,
  "salaryMid": number,
  "salaryMax": number,
  "currency": "string (e.g. USD, GBP, INR, EUR)",
  "currencySymbol": "string (e.g. $, £, ₹, €)",
  "remoteFriendly": number (0-100),
  "topCompanies": ["company1", "company2", "company3", "company4", "company5"],
  "topSkills": ["skill1", "skill2", "skill3"],
  "marketInsight": "2-3 sentence market overview"
}`;
}
