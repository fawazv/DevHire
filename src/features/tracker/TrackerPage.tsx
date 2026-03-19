import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Kanban,
  Plus,
  Download,
  ExternalLink,
  GripVertical,
  Pencil,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTrackerStore } from '@/store/trackerStore';
import { CardModal } from './CardModal';
import { formatDate } from '@/utils/formatters';
import { KANBAN_COLUMNS } from '@/types';
import type { JobCard, KanbanColumn, Priority } from '@/types';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const COLUMN_STYLES: Record<KanbanColumn, { accent: string; dot: string; header: string }> = {
  Wishlist: {
    accent: 'border-t-text-secondary',
    dot: 'bg-text-secondary',
    header: 'text-text-secondary',
  },
  Applied: {
    accent: 'border-t-accent',
    dot: 'bg-accent',
    header: 'text-accent',
  },
  Interviewing: {
    accent: 'border-t-accent-warning',
    dot: 'bg-accent-warning',
    header: 'text-accent-warning',
  },
  Offer: {
    accent: 'border-t-accent-success',
    dot: 'bg-accent-success',
    header: 'text-accent-success',
  },
  Rejected: {
    accent: 'border-t-accent-danger',
    dot: 'bg-accent-danger',
    header: 'text-accent-danger',
  },
};

const PRIORITY_BADGE: Record<Priority, string> = {
  High: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
  Medium: 'bg-accent-warning/10 text-accent-warning border-accent-warning/30',
  Low: 'bg-border text-text-secondary border-border',
};

// ─────────────────────────────────────────
// Job Card Component (draggable)
// ─────────────────────────────────────────

interface JobCardItemProps {
  card: JobCard;
  index: number;
  onEdit: (card: JobCard) => void;
}

function JobCardItem({ card, index, onEdit }: JobCardItemProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'group rounded-xl border bg-elevated p-3 space-y-2.5 transition-shadow duration-150',
            snapshot.isDragging
              ? 'border-accent shadow-[0_0_20px_rgba(79,142,247,0.25)] rotate-1 scale-[1.02]'
              : 'border-border hover:border-border-active hover:shadow-md',
          )}
        >
          {/* Drag handle + company */}
          <div className="flex items-start gap-2">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 text-text-secondary/40 hover:text-text-secondary cursor-grab active:cursor-grabbing transition-colors shrink-0"
            >
              <GripVertical size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-text truncate">{card.company}</p>
              <p className="font-body text-xs text-text-secondary truncate">{card.role}</p>
            </div>
            <button
              onClick={() => onEdit(card)}
              className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-text-secondary hover:text-text hover:bg-elevated transition-all shrink-0"
            >
              <Pencil size={12} />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('rounded-full border px-2 py-0.5 font-body text-[10px] font-semibold', PRIORITY_BADGE[card.priority])}>
              {card.priority}
            </span>
            {card.salaryRange && (
              <span className="font-body text-[10px] text-text-secondary bg-elevated border border-border rounded-full px-2 py-0.5">
                {card.salaryRange}
              </span>
            )}
          </div>

          {/* Next action */}
          {card.nextAction && (
            <p className="font-body text-[11px] text-text-secondary leading-relaxed line-clamp-2 border-l-2 border-border-active pl-2">
              → {card.nextAction}
            </p>
          )}

          {/* Footer: date + link */}
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] text-text-secondary/60">
              {formatDate(card.dateAdded)}
            </span>
            {card.link && (
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-text-secondary/40 hover:text-accent transition-colors"
              >
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─────────────────────────────────────────
// Column Component
// ─────────────────────────────────────────

interface KanbanColumnProps {
  column: KanbanColumn;
  cards: JobCard[];
  onEdit: (card: JobCard) => void;
  onAddCard: (column: KanbanColumn) => void;
}

function KanbanColumnComponent({ column, cards, onEdit, onAddCard }: KanbanColumnProps) {
  const styles = COLUMN_STYLES[column];

  return (
    <div className={cn('flex flex-col rounded-xl border-t-2 bg-surface min-w-[240px] w-full', styles.accent)}>
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', styles.dot)} />
          <span className={cn('font-body text-xs font-bold uppercase tracking-wider', styles.header)}>
            {column}
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-elevated font-body text-[11px] font-bold text-text-secondary">
            {cards.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(column)}
          className="rounded-lg p-1 text-text-secondary hover:text-text hover:bg-elevated transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-col gap-2 p-2 min-h-[120px] flex-1 rounded-b-xl transition-colors duration-150',
              snapshot.isDraggingOver && 'bg-accent/5',
            )}
          >
            {cards.map((card, i) => (
              <JobCardItem key={card.id} card={card} index={i} onEdit={onEdit} />
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <p className="font-body text-xs text-text-secondary/40 text-center pt-4 select-none">
                Drop cards here
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

type FilterPriority = 'All' | Priority;

export function TrackerPage() {
  const { cards, reorderCard, filterPriority, setFilterPriority, exportToCsv } = useTrackerStore();
  const [modalCard, setModalCard] = useState<JobCard | null | undefined>(undefined); // undefined = closed
  const [modalDefaultColumn, setModalDefaultColumn] = useState<KanbanColumn>('Wishlist');

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const { draggableId, destination } = result;
      const toColumn = destination.droppableId as KanbanColumn;
      reorderCard(draggableId, toColumn, destination.index);
    },
    [reorderCard],
  );

  const handleAddCard = useCallback((column: KanbanColumn) => {
    setModalDefaultColumn(column);
    setModalCard(null); // null = add mode
  }, []);

  const handleEditCard = useCallback((card: JobCard) => {
    setModalCard(card);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalCard(undefined); // undefined = closed
  }, []);

  const filterOptions: FilterPriority[] = ['All', 'High', 'Medium', 'Low'];

  const filteredCards = filterPriority === 'All'
    ? cards
    : cards.filter((c) => c.priority === filterPriority);

  const totalCards = cards.length;
  const offerCount = cards.filter((c) => c.column === 'Offer').length;
  const interviewingCount = cards.filter((c) => c.column === 'Interviewing').length;

  return (
    <div className="flex flex-col gap-4 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Kanban size={20} className="text-accent" />
          <h1 className="font-display text-2xl font-bold text-text">Job Hunt Tracker</h1>
        </div>
        <p className="font-body text-sm text-text-secondary">
          Track every application with drag-and-drop. Data is saved locally in your browser.
        </p>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 flex-wrap"
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-body text-xs text-text-secondary">{totalCards} applications</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent-warning" />
          <span className="font-body text-xs text-text-secondary">{interviewingCount} interviewing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent-success" />
          <span className="font-body text-xs text-text-secondary">{offerCount} offer{offerCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Filter size={13} className="text-text-secondary" />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {filterOptions.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p as typeof filterPriority)}
                className={cn(
                  'px-3 py-1 font-body text-xs transition-colors',
                  filterPriority === p
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-text-secondary hover:text-text',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 font-body text-xs text-text-secondary hover:text-text hover:border-border-active transition-colors"
          >
            <Download size={12} />
            Export CSV
          </button>
          <Button variant="primary" size="sm" onClick={() => handleAddCard('Wishlist')} leftIcon={<Plus size={14} />}>
            Add Card
          </Button>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-2 flex-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 min-w-max h-full">
            {KANBAN_COLUMNS.map((col) => {
              const colCards = filteredCards.filter((c) => c.column === col);
              return (
                <div key={col} className="w-[260px]">
                  <KanbanColumnComponent
                    column={col}
                    cards={colCards}
                    onEdit={handleEditCard}
                    onAddCard={handleAddCard}
                  />
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Card Modal */}
      {modalCard !== undefined && (
        <CardModal
          card={modalCard}
          defaultColumn={modalDefaultColumn}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
