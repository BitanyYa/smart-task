import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react';
import type { Task } from '../types/task';

const priorityConfig = {
  high:   { label: 'High',   border: 'border-l-blue-500',  badge: 'text-blue-600 dark:text-blue-400' },
  medium: { label: 'Medium', border: 'border-l-gray-400',  badge: 'text-gray-500 dark:text-gray-400' },
  low:    { label: 'Low',    border: 'border-l-gray-300',  badge: 'text-gray-400 dark:text-gray-500' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  const p = priorityConfig[task.priority];
  const isUrgent = task.priority === 'high' && task.status === 'inprogress';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 ${isUrgent ? 'border-l-orange-500' : p.border} rounded-xl shadow-sm transition-all duration-200 ${isDragging ? 'opacity-40 shadow-xl scale-105 rotate-1' : 'hover:shadow-md hover:-translate-y-0.5'}`}
    >
      {/* Drag handle strip — full width, sits at top */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-full py-1.5 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
      </div>

      {/* Card content */}
      <div className="px-4 pb-4">
        {/* Priority + actions */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${isUrgent ? 'text-orange-500' : p.badge}`}>
            {isUrgent ? 'URGENT' : p.label}
          </span>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              aria-label="Edit"
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              aria-label="Delete"
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 select-none">
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 select-none">
            {task.description}
          </p>
        )}

        {/* Date */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
          <Calendar size={11} />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
