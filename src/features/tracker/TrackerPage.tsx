import { Kanban } from 'lucide-react';

export function TrackerPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-accent-danger">
        <Kanban size={20} />
        <h1 className="text-2xl font-display font-bold text-text">Job Hunt Tracker</h1>
      </div>
      <p className="text-text-secondary font-body text-sm">Coming in Task 9 — full drag-and-drop Kanban with Zustand + localStorage persistence.</p>
    </div>
  );
}
