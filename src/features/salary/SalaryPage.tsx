import { DollarSign } from 'lucide-react';

export function SalaryPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-accent-success">
        <DollarSign size={20} />
        <h1 className="text-2xl font-display font-bold text-text">Salary & Role Intelligence</h1>
      </div>
      <p className="text-text-secondary font-body text-sm">Coming in Task 6 — global salary ranges, remote scores, and hiring companies.</p>
    </div>
  );
}
