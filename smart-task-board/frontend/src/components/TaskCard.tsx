import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, Calendar, Tag, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { isPast, format } from 'date-fns';
import type { Task } from '../types/task';

const priorityConfig = {
  high:   { label: 'High',   border: 'border-l-primary-500', badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  medium: { label: 'Medium', border: 'border-l-sage-400',    badge: 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300' },
  low:    { label: 'Low',    border: 'border-l-cream-400',   badge: 'bg-cream-200 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400' },
};

function getTotalMinutes(task: Task): number {
  let ms = 0;
  for (const e of task.timeEntries || []) {
    const start = new Date(e.startedAt).getTime();
    const end = e.stoppedAt ? new Date(e.stoppedAt).getTime() : Date.now();
    ms += end - start;
  }
  return Math.floor(ms / 60000);
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onOpenDetail }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : undefined };
  const p = priorityConfig[task.priority];
  const isUrgent = task.priority === 'high' && task.status === 'inprogress';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const totalMins = getTotalMinutes(task);

  return (
    <div ref={setNodeRef} style={style}
      className={`group relative bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 border-l-4 ${isUrgent ? 'border-l-primary-500' : p.border} rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${isDragging ? 'opacity-40 shadow-xl scale-105 rotate-1' : ''}`}>

      {/* Drag handle */}
      <div {...attributes} {...listeners}
        className="flex items-center justify-center w-full py-1.5 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={13} className="text-cream-400 group-hover:text-neutral-400 transition-colors" />
      </div>

      <div className="px-4 pb-4 cursor-pointer" onClick={() => onOpenDetail(task)}>
        {/* Priority + labels + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${p.badge}`}>
              {isUrgent ? 'URGENT' : p.label}
            </span>
            {task.labels?.slice(0, 1).map(l => (
              <span key={l} className="flex items-center gap-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                <Tag size={8} />{l}
              </span>
            ))}
            {task.isRecurring && <RefreshCw size={10} className="text-neutral-400" />}
            {task.isTimerRunning && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary-500 font-bold animate-pulse">
                <Clock size={9} /> Live
              </span>
            )}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} aria-label="Edit"
              className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors">
              <Pencil size={11} />
            </button>
            <button onClick={() => onDelete(task.id)} aria-label="Delete"
              className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-bold text-neutral-800 dark:text-cream-100 leading-snug mb-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Extra labels */}
        {(task.labels?.length ?? 0) > 1 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(1, 3).map(l => (
              <span key={l} className="flex items-center gap-0.5 text-[10px] bg-cream-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-full">
                <Tag size={8} />{l}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-300 dark:border-neutral-800/50">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-neutral-400'}`}>
                <Calendar size={10} />{format(new Date(task.dueDate), 'MMM d')}
                {isOverdue && ' · Overdue'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalMins > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-neutral-400">
                <Clock size={10} />{totalMins}m
              </span>
            )}
            {(task.comments?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-neutral-400">
                <MessageSquare size={10} />{task.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



