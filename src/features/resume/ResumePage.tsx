import { FileText } from 'lucide-react';

export function ResumePage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-accent">
        <FileText size={20} />
        <h1 className="text-2xl font-display font-bold text-text">Resume Intelligence</h1>
      </div>
      <p className="text-text-secondary font-body text-sm">Coming in Task 5 — ATS scoring, gap analysis, and bullet rewrites.</p>
    </div>
  );
}
