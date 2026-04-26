import { useRef, useEffect, useState, useCallback } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle2, X, Users, UserCheck } from 'lucide-react';
import { isPast, formatDistanceToNow, format } from 'date-fns';
import type { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead, type AppNotification } from '../api/notifications';

interface Props {
  tasks: Task[];
  onClose: () => void;
}

export const NotificationsPanel = ({ tasks, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>([]);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getNotifications(token);
      setAppNotifs(data);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    await markAllRead(token);
    setAppNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
  const dueSoon = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const diff = new Date(t.dueDate).getTime() - Date.now();
    return diff > 0 && diff < 86400000 * 2;
  });
  const recentActivity = tasks
    .flatMap(t => (t.activityLog || []).map(a => ({ ...a, taskTitle: t.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const unreadAppNotifs = appNotifs.filter(n => !n.read);
  const total = overdue.length + dueSoon.length + unreadAppNotifs.length;

  const notifIcon = (type: AppNotification['type']) => {
    if (type === 'invite_accepted') return <UserCheck size={15} className="text-primary-500 shrink-0 mt-0.5" />;
    return <Users size={15} className="text-sage-500 shrink-0 mt-0.5" />;
  };

  return (
    <div ref={ref} className="absolute right-0 top-10 w-80 bg-cream-100 dark:bg-neutral-900 rounded-xl shadow-lg border border-cream-300 dark:border-neutral-800 z-50 overflow-hidden max-h-[520px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-500" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-cream-100">Notifications</span>
          {total > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{total}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadAppNotifs.length > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-xs text-primary-500 hover:text-primary-600 px-2 py-0.5 rounded transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-gray-600 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Invite notifications */}
        {appNotifs.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-primary-500 uppercase tracking-wider">Team</p>
            {appNotifs.map(n => (
              <div key={n._id}
                className={`flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-cream-200 dark:hover:bg-neutral-800 ${!n.read ? 'bg-primary-50 dark:bg-primary-950/20' : ''}`}>
                {notifIcon(n.type)}
                <div className="min-w-0">
                  <p className={`text-sm truncate ${!n.read ? 'font-semibold text-neutral-800 dark:text-cream-100' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-neutral-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-red-500 uppercase tracking-wider">Overdue</p>
            {overdue.map(t => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-cream-100 truncate">{t.title}</p>
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
              <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-cream-100 truncate">{t.title}</p>
                  <p className="text-xs text-amber-400">Due {format(new Date(t.dueDate!), 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-bold text-neutral-400 uppercase tracking-wider">Recent Activity</p>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
                <CheckCircle2 size={15} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                    <span className="font-medium">{a.taskTitle}</span>
                  </p>
                  <p className="text-xs text-neutral-400">{a.action} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
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
