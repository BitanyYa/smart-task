import { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfileDropdown } from './ProfileDropdown';
import { getNotifications } from '../api/notifications';
import type { Task } from '../types/task';
import type { Page } from '../types/navigation';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  tasks: Task[];
  onNavigate: (page: Page) => void;
}

export const Navbar = ({ search, onSearch, tasks, onNavigate }: Props) => {
  const { theme, toggle } = useTheme();
  const { user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const notifs = await getNotifications(token);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const totalBadge = overdueCount + unreadCount;

  const iconBtn = "w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-cream-100 dark:hover:text-cream-100 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800 transition-colors";

  return (
    <header className="h-12 bg-cream-200 dark:bg-neutral-950 border-b border-cream-400 dark:border-neutral-700 flex items-center px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-cream-100 dark:bg-neutral-900 border border-cream-400 dark:border-neutral-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:bg-white dark:focus-within:bg-neutral-700 transition-all w-72">
        <Search size={13} className="text-neutral-400 shrink-0" />
        <input value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Search tasks, files, teammates..."
          className="bg-transparent outline-none text-sm text-neutral-800 dark:text-cream-100 placeholder-neutral-400 dark:placeholder-neutral-500 flex-1"
          aria-label="Search tasks" />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="relative">
          <button onClick={() => { setShowNotifications(p => !p); setShowProfile(false); }} aria-label="Notifications" className={iconBtn}>
            <Bell size={16} />
          </button>
          {totalBadge > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none pointer-events-none">
              {totalBadge > 99 ? '99+' : totalBadge}
            </span>
          )}
          {showNotifications && <NotificationsPanel tasks={tasks} onClose={() => { setShowNotifications(false); fetchUnread(); }} onNavigate={onNavigate} />}
        </div>

        <button onClick={() => onNavigate('settings')} aria-label="Settings" className={iconBtn}>
          <Settings size={16} />
        </button>

        <button onClick={toggle} aria-label="Toggle theme" className={iconBtn}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="relative ml-1">
          <button onClick={() => { setShowProfile(p => !p); setShowNotifications(false); }}
            className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all overflow-hidden"
            title={user?.name}>
            {(user as any)?.avatar ? (
              <img src={(user as any).avatar} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </button>
          {showProfile && <ProfileDropdown onNavigate={onNavigate} onClose={() => setShowProfile(false)} />}
        </div>
      </div>
    </header>
  );
};



