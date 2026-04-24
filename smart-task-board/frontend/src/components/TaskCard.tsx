import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, Calendar, Tag, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { isPast, format } from 'date-fns';
import type { Task } from '../types/task';

const priorityConfig = {
  high:   { label: 'High',   border: 'border-l-blue-500',   badge: 'text-blue-600 dark:text-blue-400' },
  medium: { label: 'Medium', border: 'border-l-gray-400',   badge: 'text-gray-500 dark:text-gray-400' },
  low:    { label: 'Low',    border: 'border-l-gray-300',   badge: 'text-gray-400 dark:text-gray-500' },
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
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 ${isUrgent ? 'border-l-orange-500' : p.border} rounded-xl shadow-sm transition-all duration-200 ${isDragging ? 'opacity-40 shadow-xl scale-105 rotate-1' : 'hover:shadow-md hover:-translate-y-0.5'}`}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners}
        className="flex items-center justify-center w-full py-1.5 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={14} className="text-gray-200 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>

      <div className="px-4 pb-4" onClick={() => onOpenDetail(task)}>
        {/* Priority + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${isUrgent ? 'text-orange-500' : p.badge}`}>
              {isUrgent ? 'URGENT' : p.label}
            </span>
            {task.isRecurring && <RefreshCw size={10} className="text-gray-400" title="Recurring" />}
            {task.isTimerRunning && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-semibold animate-pulse">
                <Clock size={9} /> Live
              </span>
            )}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} aria-label="Edit"
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
              <Pencil size={11} />
            </button>
            <button onClick={() => onDelete(task.id)} aria-label="Delete"
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 3).map(l => (
              <span key={l} className="flex items-center gap-0.5 text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                <Tag size={8} />{l}
              </span>
            ))}
            {task.labels.length > 3 && <span className="text-[10px] text-gray-400">+{task.labels.length - 3}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                <Calendar size={10} />
                {format(new Date(task.dueDate), 'MMM d')}
                {isOverdue && ' · Overdue'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalMins > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <Clock size={10} />{totalMins}m
              </span>
            )}
            {task.comments?.length > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <MessageSquare size={10} />{task.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
