import { Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-primary text-text">
      {/* Basic Sidebar Shell Placeholder */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col p-4">
        <h1 className="text-xl font-display font-bold text-text-accent mb-8">
          DevHire Intelligence
        </h1>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Dashboard</Link>
          <Link to="/resume" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Resume AI</Link>
          <Link to="/salary" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Salary Intel</Link>
          <Link to="/outreach" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Outreach</Link>
          <Link to="/interview" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Interviews</Link>
          <Link to="/tracker" className="text-sm text-text-secondary hover:text-text transition-colors p-2 rounded-md hover:bg-elevated">Job Tracker</Link>
        </nav>
      </aside>

      {/* Main Content Area Placeholder */}
      <main className="flex-1 overflow-auto p-8">
        <Routes>
          <Route path="/" element={<div className="animate-pulse">Dashboard Placeholder</div>} />
          <Route path="/resume" element={<div className="animate-pulse">Resume Intelligence Placeholder</div>} />
          <Route path="/salary" element={<div className="animate-pulse">Salary & Role Intelligence Placeholder</div>} />
          <Route path="/outreach" element={<div className="animate-pulse">Cold Outreach Generator Placeholder</div>} />
          <Route path="/interview" element={<div className="animate-pulse">Interview Prep Coach Placeholder</div>} />
          <Route path="/tracker" element={<div className="animate-pulse">Job Hunt Tracker Placeholder</div>} />
        </Routes>
      </main>
    </div>
  );
}
