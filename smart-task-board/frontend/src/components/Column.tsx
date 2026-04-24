import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, CheckCircle2, Archive } from 'lucide-react';
import type { Task, Status } from '../types/task';
import { TaskCard } from './TaskCard';

const columnConfig: Record<Status, {
  label: string;
  dot: string;
  countBg: string;
  countText: string;
  headerBorder: string;
  action: React.ReactNode;
}> = {
  todo: {
    label: 'To Do',
    dot: 'bg-gray-400',
    countBg: 'bg-gray-100 dark:bg-gray-800',
    countText: 'text-gray-600 dark:text-gray-400',
    headerBorder: '',
    action: <Plus size={15} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors" />,
  },
  inprogress: {
    label: 'In Progress',
    dot: 'bg-blue-500',
    countBg: 'bg-blue-100 dark:bg-blue-950/40',
    countText: 'text-blue-600 dark:text-blue-400',
    headerBorder: 'border-b-2 border-blue-500',
    action: <MoreHorizontal size={15} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors" />,
  },
  done: {
    label: 'Done',
    dot: 'bg-gray-400',
    countBg: 'bg-gray-100 dark:bg-gray-800',
    countText: 'text-gray-600 dark:text-gray-400',
    headerBorder: '',
    action: <CheckCircle2 size={15} className="text-gray-400 cursor-pointer" />,
  },
};

interface Props {
  status: Status;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}

export const Column = ({ status, tasks, onEdit, onDelete, onAdd }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const c = columnConfig[status];

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-4 pb-3 ${c.headerBorder}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.label}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${c.countBg} ${c.countText}`}>
            {tasks.length}
          </span>
        </div>
        <button onClick={onAdd} aria-label="Add task">
          {c.action}
        </button>
      </div>

      {/* Cards */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-3 min-h-[200px] rounded-xl transition-colors duration-150 ${isOver ? 'bg-blue-50/60 dark:bg-blue-950/10' : ''}`}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}

          {/* Archive drop zone for Done column */}
          {status === 'done' && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-600">
              <Archive size={20} />
              <p className="text-xs text-center px-4">Drag completed tasks here to archive</p>
            </div>
          )}

          {status !== 'done' && tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-300 dark:text-gray-600">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
