import { Trash2, RotateCcw, X } from 'lucide-react';
import type { Task } from '../types/task';

interface Props {
  tasks: Task[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const TrashPanel = ({ tasks, onRestore, onPermanentDelete, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 dark:border-gray-700/60 w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <Trash2 size={14} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Trash</h2>
              <p className="text-xs text-gray-400">{tasks.length} deleted task{tasks.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6" />

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600 gap-2">
              <Trash2 size={28} />
              <p className="text-sm">Trash is empty</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 line-through line-clamp-1">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Deleted {formatDate(task.deletedAt!)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => onRestore(task.id)}
                    aria-label="Restore"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                  >
                    <RotateCcw size={11} />
                    Restore
                  </button>
                  <button
                    onClick={() => onPermanentDelete(task.id)}
                    aria-label="Delete permanently"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-400 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-lg transition-colors"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
