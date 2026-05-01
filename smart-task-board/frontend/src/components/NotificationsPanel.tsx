import { useRef, useEffect, useState, useCallback } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle2, X, Users, UserCheck, Trash2 } from 'lucide-react';
import { isPast, formatDistanceToNow, format } from 'date-fns';
import type { Task } from '../types/task';
import type { Page } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead, markAsRead, deleteNotification, type AppNotification } from '../api/notifications';

interface Props {
  tasks: Task[];
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export const NotificationsPanel = ({ tasks, onClose, onNavigate }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getNotifications(token);
      setAppNotifs(data);
    } catch { /* silent */ } finally { setLoading(false); }
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

  const handleMarkOneRead = async (id: string) => {
    if (!token) return;
    await markAsRead(token, id);
    setAppNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    await deleteNotification(token, id);
    setAppNotifs(prev => prev.filter(n => n._id !== id));
  };

  const handleNotifClick = (n: AppNotification) => {
    if (!n.read) handleMarkOneRead(n._id);
    
    if (n.type === 'invite_accepted' || n.type === 'invite_received') {
      onNavigate('teams');
      onClose();
    }
  };

  const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
  const dueSoon = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    const diff = new Date(t.dueDate).getTime() - Date.now();
    return diff > 0 && diff < 86400000 * 2;
  });
  const recentActivity = tasks
    .flatMap(t => (t.activityLog || []).map(a => ({ ...a, taskId: t.id, taskTitle: t.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const unreadAppNotifs = appNotifs.filter(n => !n.read);
  const total = overdue.length + dueSoon.length + unreadAppNotifs.length;

  const notifIcon = (type: AppNotification['type']) => {
    if (type === 'invite_accepted') return <UserCheck size={14} className="text-primary-500 shrink-0 mt-0.5" />;
    if (type === 'invite_received') return <Users size={14} className="text-amber-500 shrink-0 mt-0.5" />;
    return <Bell size={14} className="text-sage-500 shrink-0 mt-0.5" />;
  };

  return (
    <div ref={ref} className="absolute right-0 top-10 w-80 bg-cream-100 dark:bg-neutral-900 rounded-xl shadow-2xl border border-cream-300 dark:border-neutral-800 z-50 overflow-hidden max-h-[520px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-500" />
          <span className="text-sm font-bold text-neutral-800 dark:text-cream-100">Notifications</span>
          {total > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{total}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadAppNotifs.length > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 px-2 py-1 rounded transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-gray-600 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {loading && appNotifs.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* App Notifications (Invites, etc) */}
            {appNotifs.length > 0 && (
              <div className="border-b border-cream-200 dark:border-neutral-800 last:border-0">
                <p className="px-4 pt-3 pb-1 text-[10px] font-black text-primary-500 uppercase tracking-widest">Updates</p>
                {appNotifs.map(n => (
                  <div key={n._id}
                    onClick={() => handleNotifClick(n)}
                    className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-cream-200 dark:hover:bg-neutral-800 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-950/10' : ''}`}>
                    {notifIcon(n.type)}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-tight mb-0.5 ${!n.read ? 'font-bold text-neutral-800 dark:text-cream-100' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-medium">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                      <button 
                        onClick={(e) => handleDeleteNotif(n._id, e)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="border-b border-cream-200 dark:border-neutral-800 last:border-0">
                <p className="px-4 pt-3 pb-1 text-[10px] font-black text-red-500 uppercase tracking-widest">Overdue</p>
                {overdue.map(t => (
                  <div key={t.id} className="flex items-start gap-3 px-4 py-3 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-800 dark:text-cream-100 truncate">{t.title}</p>
                      <p className="text-[10px] text-red-400 font-medium uppercase tracking-tight">Due {format(new Date(t.dueDate!), 'MMM d')} · {formatDistanceToNow(new Date(t.dueDate!), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Due soon */}
            {dueSoon.length > 0 && (
              <div className="border-b border-cream-200 dark:border-neutral-800 last:border-0">
                <p className="px-4 pt-3 pb-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">Due Soon</p>
                {dueSoon.map(t => (
                  <div key={t.id} className="flex items-start gap-3 px-4 py-3 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                    <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-800 dark:text-cream-100 truncate">{t.title}</p>
                      <p className="text-[10px] text-amber-400 font-medium uppercase tracking-tight">Due {format(new Date(t.dueDate!), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent activity */}
            {recentActivity.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recent Activity</p>
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-cream-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                    <CheckCircle2 size={14} className="text-neutral-300 dark:text-neutral-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate leading-tight">
                        <span className="font-bold text-neutral-800 dark:text-cream-100">{a.taskTitle}</span>
                      </p>
                      <p className="text-[10px] text-neutral-400 font-medium">{a.action} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {total === 0 && recentActivity.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-300 dark:text-neutral-700 gap-3">
            <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-neutral-800 flex items-center justify-center">
              <Bell size={24} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-cream-200 dark:border-neutral-800 bg-cream-50 dark:bg-neutral-900/50 flex flex-col gap-2">
        <button 
          onClick={() => { onNavigate('notifications'); onClose(); }}
          className="w-full py-2 text-xs font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition-all border border-primary-100 dark:border-primary-900/30"
        >
          See All Notifications
        </button>
        <p className="text-[9px] text-neutral-400 text-center uppercase font-bold tracking-tighter">You're receiving these based on your workspace settings</p>
      </div>
    </div>
  );
};
