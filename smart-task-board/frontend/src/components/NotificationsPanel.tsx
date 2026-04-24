import { useRef, useEffect } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle2, X } from 'lucide-react';
import { isPast, formatDistanceToNow, format } from 'date-fns';
import type { Task } from '../types/task';

interface Props {
  tasks: Task[];
  onClose: () => void;
}

export const NotificationsPanel = ({ tasks, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
  const dueSoon = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const diff = new Date(t.dueDate).getTime() - Date.now();
    return diff > 0 && diff < 86400000 * 2; // within 2 days
  });
  const recentActivity = tasks
    .flatMap(t => (t.activityLog || []).map(a => ({ ...a, taskTitle: t.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const total = overdue.length + dueSoon.length;

  return (
    <div ref={ref} className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[480px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          {total > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{total}</span>
          )}
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-red-500 uppercase tracking-wider">Overdue</p>
            {overdue.map(t => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                  <p className="text-xs text-red-400">Due {format(new Date(t.dueDate!), 'MMM d')} · {formatDistanceToNow(new Date(t.dueDate!), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Due soon */}
        {dueSoon.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-amber-500 uppercase tracking-wider">Due Soon</p>
            {dueSoon.map(t => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                  <p className="text-xs text-amber-400">Due {format(new Date(t.dueDate!), 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Activity</p>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CheckCircle2 size={15} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    <span className="font-medium">{a.taskTitle}</span>
                  </p>
                  <p className="text-xs text-gray-400">{a.action} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {total === 0 && recentActivity.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-300 dark:text-gray-600 gap-2">
            <Bell size={24} />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};
