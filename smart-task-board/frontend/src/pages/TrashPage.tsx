import { Trash2, RotateCcw, Calendar } from 'lucide-react';
import type { Task } from '../types/task';

interface Props { tasks: Task[]; onRestore: (id: string) => void; onPermanentDelete: (id: string) => void; }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const TrashPage = ({ tasks, onRestore, onPermanentDelete }: Props) => (
  <div className="px-8 py-7">
    <div className="mb-7">
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">Trash</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Deleted tasks. Restore or permanently delete them.</p>
    </div>

    {tasks.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-300 dark:text-neutral-600 dark:text-neutral-400 gap-3">
        <Trash2 size={40} />
        <p className="text-sm font-medium">Trash is empty</p>
        <p className="text-xs text-neutral-400">Deleted tasks will appear here</p>
      </div>
    ) : (
      <div className="bg-cream-100 dark:bg-neutral-900 rounded-xl border border-cream-300 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-cream-300 dark:border-neutral-800 flex items-center gap-2">
          <Trash2 size={14} className="text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {tasks.length} deleted task{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="divide-y divide-cream-200 dark:divide-neutral-800">
          {tasks.map(task => (
            <div key={task.id} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 line-through line-clamp-1">{task.title}</p>
                {task.description && <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{task.description}</p>}
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-neutral-400">
                  <Calendar size={10} />
                  <span>Deleted {formatDate(task.deletedAt!)}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => onRestore(task.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-950/40 hover:bg-sage-100 dark:hover:bg-sage-950/60 rounded-lg transition-colors">
                  <RotateCcw size={11} /> Restore
                </button>
                <button onClick={() => onPermanentDelete(task.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-lg transition-colors">
                  <Trash2 size={11} /> Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);


