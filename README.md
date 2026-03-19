# DevHire Intelligence Platform

> **An AI-powered job application co-pilot for self-taught developers breaking into the global tech market.**

Built with **React 18 + TypeScript 5 + Gemini 2.5 Flash** — a flagship portfolio project demonstrating senior-level engineering: clean architecture, security-first design, streaming AI integrations, and world-class UI/UX.

---

## ✨ Features

### 1 · Resume Intelligence Engine
Upload a job description and your resume text. Gemini streams back:
- **ATS Score** — animated SVG ring with percentage match
- **Missing Keywords** — color-coded badges for gaps
- **Bullet Rewrites** — side-by-side before/after improvement cards with one-click copy
- Streaming JSON parsed with Zod schema validation

### 2 · Salary & Role Intelligence
Select a role, tech stack, and target country. Gemini synthesizes live market data:
- **Animated salary bar** — min / median / max with glowing gradient fill
- **Remote-friendliness score** — 0–100 with color-coded pill (green/amber/red)
- **Top 5 hiring companies** for that role/stack/country
- **Top 3 salary-boosting skills** to prioritize
- **Market insight** — 2–3 sentence Gemini synthesis

### 3 · Cold Outreach Generator
Fill in company, role, and a 3-line background summary. Gemini generates:
- **Personalized cold email** — punchy subject + concise body under 200 words
- **LinkedIn DM** — conversational short-form under 100 words
- **Tone badge** — Professional / Warm / Bold / Concise / Story-driven
- One-click copy for each variant + **Regenerate** button

### 4 · Interview Prep Coach
Select stage, experience level, and tech stack. Gemini generates:
- **5 targeted Q&A cards** — expandable accordion with difficulty badges (Easy/Medium/Hard)
- **Model answers** — what great answers include
- **What they're testing** — honest single-sentence insight
- **Follow-up question** — what the interviewer asks next
- **Generate 5 More** — sends previous questions to avoid repetition

### 5 · Job Hunt Tracker (Kanban)
A full drag-and-drop Kanban board persisted in `localStorage`:
- **5 columns**: Wishlist → Applied → Interviewing → Offer → Rejected
- **Job cards** — company, role, salary range, priority, next action, date, external link
- **Add / Edit modal** — full form with validation, priority selector, delete confirmation
- **Priority filter** — All / High / Medium / Low
- **CSV export** — one-click download of all applications
- **Live Dashboard stats** — application counts shown on the home screen in real-time

---

## 🏗 Architecture

```
src/
├── api/              # Gemini API client + streaming function
├── components/
│   ├── features/     # AtsScoreRing, ErrorBoundary, ApiKeyManager
│   ├── layout/       # Sidebar, TopBar, MobileNav, PageWrapper
│   └── ui/           # Button, Card, Input, Badge, Skeleton, Toast, Spinner
├── features/
│   ├── dashboard/    # DashboardPage with live tracker stats
│   ├── resume/       # ResumePage
│   ├── salary/       # SalaryPage
│   ├── outreach/     # OutreachPage
│   ├── interview/    # InterviewPage
│   ├── tracker/      # TrackerPage + CardModal
│   └── NotFoundPage.tsx
├── hooks/            # useGeminiStream, useToast, useLocalStorage
├── store/            # Zustand: appStore, trackerStore
├── types/            # Zod schemas + inferred TypeScript types
└── utils/            # prompts.ts, rateLimiter.ts, security.ts, formatters.ts, cn.ts
```

### Key Design Decisions

| Concern | Solution |
|---|---|
| AI streaming | `ReadableStream` with `TextDecoder`; `useGeminiStream` hook abstracts state |
| JSON robustness | All Gemini responses validated with **Zod** after streaming completes |
| Rate limiting | Client-side **token bucket** (15 req/min) in `rateLimiter.ts` |
| State | **Zustand** for global UI state; **Immer** for immutable tracker mutations |
| Persistence | `localStorage` with Zod validation on read (corrupt data is discarded safely) |
| Code splitting | Every feature page is `React.lazy()` — initial bundle is **116 kB gzipped** |
| Error isolation | Per-route **Error Boundaries** — one feature crash never kills the whole app |

---

## 🔒 Security Model

- **API key stored in `sessionStorage`** — cleared automatically on tab close, never in `localStorage` or cookies
- **Input sanitization** — all user inputs are stripped and wrapped in delimiter tags before injection into Gemini prompts (`CONTEXT_START` / `CONTEXT_END` pattern)
- **Prompt injection defense** — sanitizeInput utility strips `<`, `>`, backticks, and control characters
- **Zod schema enforcement** — Gemini is given an exact JSON schema in every prompt; responses are validated before use
- **No keys in source code** — Vite `.env` only holds non-secret app metadata

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 (Vite) |
| Styling | Tailwind CSS v3 + custom CSS design tokens |
| Animations | Framer Motion |
| State | Zustand 4 + Immer |
| Data Fetching | TanStack React Query v5 |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Schema | Zod v3 |
| Drag & Drop | @hello-pangea/dnd |
| Icons | Lucide React |
| Build | Vite 5 |
| Type checking | TypeScript strict mode |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A free **Gemini API key** — get yours at [ai.google.dev](https://ai.google.dev)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/devhire-intelligence-platform.git
cd devhire-intelligence-platform

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Setting Your API Key

1. Click **Settings** (key icon) in the top-right corner of the app
2. Paste your Gemini API key
3. Click **Save** — the key is validated and stored securely in `sessionStorage`

> The key is never sent to any server other than Google's Gemini API directly from your browser.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (HMR) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint with 0 warnings policy |
| `npm run test` | Run Vitest unit tests |

---

## 📊 Bundle Analysis

```
Feature chunks (gzipped):
  NotFoundPage    →   0.88 kB
  DashboardPage   →   2.63 kB
  OutreachPage    →   3.44 kB
  InterviewPage   →   3.47 kB
  ResumePage      →   3.70 kB
  SalaryPage      →   4.33 kB
  TrackerPage     →  35.78 kB  (includes @hello-pangea/dnd)
  
Initial bundle:
  Vendor (React + Router + Motion + Query)  →  116.81 kB ✅
  Target: < 200 kB ✅
```

All feature pages are **lazy-loaded** — users only download what they navigate to.

---

## 🗺 Roadmap

- [ ] **Unit tests** — Vitest tests for prompt builders, Zod schemas, and rateLimiter
- [ ] **Deployment** — Vercel one-click deploy with CI/CD pipeline
- [ ] **Application notes** — Rich-text notes in tracker cards
- [ ] **Dark/Light toggle** — System preference detection
- [ ] **Gemini model selector** — Switch between Flash and Pro
- [ ] **Export to PDF** — Resume analysis report download

---

## 📁 Environment Variables

```env
# .env.example
VITE_APP_NAME=DevHire Intelligence Platform
```

> Only non-secret metadata goes in `.env`. The Gemini API key is handled entirely in the browser via the Settings modal.

---

## 🤝 Contributing

This is a portfolio project, but PRs are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add X"`
4. Open a PR — describe what and why

---

## 👤 Author

**Fawaz** — Self-taught developer building production-grade applications.

---

## 📄 License

MIT — free to use, modify, and distribute.
