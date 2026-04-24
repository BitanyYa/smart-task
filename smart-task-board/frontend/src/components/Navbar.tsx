import { useState } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfileDropdown } from './ProfileDropdown';
import type { Task } from '../types/task';
import type { Page } from '../types/navigation';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  tasks: Task[];
  onNavigate: (page: Page) => void;
}

export const Navbar = ({ search, onSearch, tasks, onNavigate }: Props) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const overdueCount = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  return (
    <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 shrink-0">
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-400/30 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-36"
            aria-label="Search tasks"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(p => !p); setShowProfile(false); }}
            aria-label="Notifications"
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell size={15} />
            {overdueCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {showNotifications && (
            <NotificationsPanel tasks={tasks} onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Settings shortcut */}
        <button
          onClick={() => onNavigate('settings')}
          aria-label="Settings"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings size={15} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotifications(false); }}
            className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer select-none hover:ring-2 hover:ring-teal-300 transition-all"
            title={user?.name}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
          {showProfile && (
            <ProfileDropdown onNavigate={onNavigate} onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>
    </header>
  );
};
