import { Bell, AlertCircle, CheckCircle2, Trash2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { getNotifications, markAllRead, markAsRead, deleteNotification, type AppNotification } from '../api/notifications';
import { useState, useEffect, useCallback } from 'react';
import type { Page } from '../types/navigation';

interface Props {
  onNavigate: (page: Page) => void;
}

export const NotificationsPage = ({ onNavigate }: Props) => {
  const { tasks } = useTasks();
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setAppNotifs(data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setAppNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkOneRead = async (id: string) => {
    await markAsRead(id);
    setAppNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
    setAppNotifs(prev => prev.filter(n => n._id !== id));
  };

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

  return (
    <div className="px-8 py-7 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('board')} className="p-2 hover:bg-cream-300 dark:hover:bg-neutral-800 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-neutral-500" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100">Notifications</h1>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-6">
        {/* Urgent Section */}
        {overdue.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-red-500 mb-3 px-1">Urgent Attention</h2>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl overflow-hidden">
              {overdue.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 border-b border-red-100 dark:border-red-900/30 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-800 dark:text-cream-100">{t.title}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">Overdue since {format(new Date(t.dueDate!), 'MMM d, yyyy')}</p>
                  </div>
                  <button onClick={() => onNavigate('my-tasks')} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                    View Task
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* System & Team Notifications */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 px-1">Recent Updates</h2>
          <div className="bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading notifications...</p>
              </div>
            ) : appNotifs.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cream-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <Bell size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-800 dark:text-cream-100">No new notifications</p>
                  <p className="text-xs text-neutral-400 mt-1">We'll let you know when something important happens.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-cream-200 dark:divide-neutral-800">
                {appNotifs.map(n => (
                  <div 
                    key={n._id}
                    onClick={() => !n.read && handleMarkOneRead(n._id)}
                    className={`group relative flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors hover:bg-cream-200 dark:hover:bg-neutral-800 ${!n.read ? 'bg-primary-50/30 dark:bg-primary-950/10' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'invite_accepted' ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-500' :
                      n.type === 'invite_received' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-500' :
                      'bg-cream-300 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      {n.type === 'invite_accepted' ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-0.5 ${!n.read ? 'font-bold text-neutral-800 dark:text-cream-100' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-neutral-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                      <button 
                        onClick={(e) => handleDeleteNotif(n._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
