import { create } from 'zustand';
import { produce } from 'immer';
import { JobCardSchema, TrackerStateSchema } from '@/types';
import type { JobCard, KanbanColumn } from '@/types';

// ─────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────

const STORAGE_KEY = 'dhip_tracker_v1';

function loadFromStorage(): JobCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultCards();
    const parsed = TrackerStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.cards : getDefaultCards();
  } catch {
    return getDefaultCards();
  }
}

function saveToStorage(cards: JobCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards }));
  } catch {
    // Ignore storage errors silently
  }
}

/** Returns a set of starter cards to show on first load */
function getDefaultCards(): JobCard[] {
  return [
    {
      id: 'demo-1',
      company: 'Vercel',
      role: 'Frontend Engineer',
      salaryRange: '$120k – $160k',
      link: 'https://vercel.com/careers',
      notes: 'Applied via LinkedIn. Know someone on the team.',
      nextAction: 'Follow up on application',
      priority: 'High',
      column: 'Applied',
      dateAdded: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      company: 'Stripe',
      role: 'React Developer',
      salaryRange: '$130k – $170k',
      link: 'https://stripe.com/jobs',
      notes: 'Great team culture, check Glassdoor reviews.',
      nextAction: 'Prepare system design answers',
      priority: 'High',
      column: 'Interviewing',
      dateAdded: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      company: 'Shopify',
      role: 'Full Stack Developer',
      salaryRange: '$100k – $140k',
      notes: 'Found on their website',
      nextAction: 'Tailor resume for Rails experience',
      priority: 'Medium',
      column: 'Wishlist',
      dateAdded: new Date().toISOString(),
    },
  ];
}

// ─────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────

interface TrackerStore {
  cards: JobCard[];
  filterPriority: 'All' | 'High' | 'Medium' | 'Low';
  // Actions
  addCard: (card: Omit<JobCard, 'id' | 'dateAdded'>) => void;
  updateCard: (id: string, updates: Partial<JobCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, toColumn: KanbanColumn) => void;
  reorderCard: (id: string, toColumn: KanbanColumn, toIndex: number) => void;
  setFilterPriority: (priority: 'All' | 'High' | 'Medium' | 'Low') => void;
  exportToCsv: () => void;
}

// ─────────────────────────────────────────
// Store
// ─────────────────────────────────────────

export const useTrackerStore = create<TrackerStore>((set, get) => ({
  cards: loadFromStorage(),
  filterPriority: 'All',

  addCard: (card) => {
    const newCard: JobCard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dateAdded: new Date().toISOString(),
    };
    // Validate with Zod before storing
    const parsed = JobCardSchema.safeParse(newCard);
    if (!parsed.success) return;
    set(
      produce((state: TrackerStore) => {
        state.cards.unshift(parsed.data);
        saveToStorage(state.cards);
      }),
    );
  },

  updateCard: (id, updates) => {
    set(
      produce((state: TrackerStore) => {
        const idx = state.cards.findIndex((c) => c.id === id);
        if (idx === -1) return;
        state.cards[idx] = { ...state.cards[idx], ...updates };
        saveToStorage(state.cards);
      }),
    );
  },

  deleteCard: (id) => {
    set(
      produce((state: TrackerStore) => {
        state.cards = state.cards.filter((c) => c.id !== id);
        saveToStorage(state.cards);
      }),
    );
  },

  moveCard: (id, toColumn) => {
    set(
      produce((state: TrackerStore) => {
        const card = state.cards.find((c) => c.id === id);
        if (card) {
          card.column = toColumn;
          saveToStorage(state.cards);
        }
      }),
    );
  },

  reorderCard: (id, toColumn, toIndex) => {
    set(
      produce((state: TrackerStore) => {
        const fromIdx = state.cards.findIndex((c) => c.id === id);
        if (fromIdx === -1) return;
        const [card] = state.cards.splice(fromIdx, 1);
        card.column = toColumn;
        // Find the insertion position within the target column
        const colCards = state.cards.filter((c) => c.column === toColumn);
        const afterId = colCards[toIndex]?.id;
        if (afterId) {
          const targetIdx = state.cards.findIndex((c) => c.id === afterId);
          state.cards.splice(targetIdx, 0, card);
        } else {
          state.cards.push(card);
        }
        saveToStorage(state.cards);
      }),
    );
  },

  setFilterPriority: (priority) => set({ filterPriority: priority }),

  exportToCsv: () => {
    const { cards } = get();
    const headers = ['Company', 'Role', 'Column', 'Priority', 'Salary Range', 'Link', 'Notes', 'Next Action', 'Date Added'];
    const rows = cards.map((c) => [
      c.company,
      c.role,
      c.column,
      c.priority,
      c.salaryRange ?? '',
      c.link ?? '',
      (c.notes ?? '').replace(/,/g, ';'),
      (c.nextAction ?? '').replace(/,/g, ';'),
      new Date(c.dateAdded).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhire-tracker-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
