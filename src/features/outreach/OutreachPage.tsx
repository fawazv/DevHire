import { Mail } from 'lucide-react';

export function OutreachPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-accent-warning">
        <Mail size={20} />
        <h1 className="text-2xl font-display font-bold text-text">Cold Outreach Generator</h1>
      </div>
      <p className="text-text-secondary font-body text-sm">Coming in Task 7 — personalized emails and LinkedIn DMs, streamed live.</p>
    </div>
  );
}
