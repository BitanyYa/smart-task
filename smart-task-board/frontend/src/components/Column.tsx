import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, CheckCircle2, Archive } from 'lucide-react';
import type { Task, Status } from '../types/task';
import { TaskCard } from './TaskCard';

const columnConfig: Record<Status, { label: string; dot: string; countBg: string; countText: string; headerBorder: string }> = {
  todo:       { label: 'Backlog',        dot: 'bg-neutral-400',  countBg: 'bg-cream-300 dark:bg-neutral-800',       countText: 'text-neutral-600 dark:text-neutral-400', headerBorder: '' },
  inprogress: { label: 'In Progress',    dot: 'bg-primary-500',  countBg: 'bg-primary-100 dark:bg-primary-950/40',  countText: 'text-primary-600 dark:text-primary-400', headerBorder: 'border-b-2 border-primary-500' },
  done:       { label: 'Ready to Launch',dot: 'bg-sage-400',     countBg: 'bg-sage-100 dark:bg-sage-950/40',        countText: 'text-sage-600 dark:text-sage-400',       headerBorder: '' },
};

interface Props {
  status: Status;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  onOpenDetail: (task: Task) => void;
}

export const Column = ({ status, tasks, onEdit, onDelete, onAdd, onOpenDetail }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const c = columnConfig[status];

  return (
    <div className="flex flex-col min-w-0">
      <div className={`flex items-center justify-between mb-4 pb-3 ${c.headerBorder}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{c.label}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${c.countBg} ${c.countText}`}>{tasks.length}</span>
        </div>
        <button onClick={onAdd} aria-label="Add task">
          {status === 'inprogress'
            ? <MoreHorizontal size={15} className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-cream-200 cursor-pointer transition-colors" />
            : status === 'done'
            ? <CheckCircle2 size={15} className="text-neutral-400 cursor-pointer" />
            : <Plus size={15} className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-cream-200 cursor-pointer transition-colors" />
          }
        </button>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef}
          className={`flex flex-col gap-3 min-h-[200px] rounded-xl transition-colors duration-150 ${isOver ? 'bg-primary-50/60 dark:bg-primary-950/10' : ''}`}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onOpenDetail={onOpenDetail} />
          ))}
          {status === 'done' && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-cream-400 dark:border-neutral-700 rounded-xl text-neutral-400">
              <Archive size={20} />
              <p className="text-xs text-center px-4">Drag completed tasks here</p>
            </div>
          )}
          {status !== 'done' && tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-cream-400 dark:border-neutral-700 rounded-xl text-xs text-neutral-300">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};



