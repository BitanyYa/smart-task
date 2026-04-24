import { Archive, Calendar, RotateCcw } from 'lucide-react';
import type { Task } from '../types/task';

interface Props {
  tasks: Task[];
  onRestore: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const ArchivePage = ({ tasks, onRestore }: Props) => {
  const archived = tasks.filter(t => t.status === 'done');

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Archive</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed tasks are stored here for reference.</p>
      </div>

      {archived.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300 dark:text-gray-600 gap-3">
          <Archive size={40} />
          <p className="text-sm font-medium">No archived tasks yet</p>
          <p className="text-xs text-gray-400">Tasks marked as Done will appear here</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Archive size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {archived.length} completed task{archived.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {archived.map(task => (
              <div key={task.id} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 line-through line-clamp-1">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                    <Calendar size={10} />
                    <span>Completed {formatDate(task.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRestore(task.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw size={11} />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
