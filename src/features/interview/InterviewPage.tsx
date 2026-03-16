import { MessageSquare } from 'lucide-react';

export function InterviewPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-accent-gemini">
        <MessageSquare size={20} />
        <h1 className="text-2xl font-display font-bold text-text">Interview Prep Coach</h1>
      </div>
      <p className="text-text-secondary font-body text-sm">Coming in Task 8 — targeted Q&A with model answers, insights, and follow-ups.</p>
    </div>
  );
}
