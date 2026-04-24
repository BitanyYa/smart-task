import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ search, onSearch }: { search: string; onSearch: (v: string) => void }) => {
  const { theme, toggle } = useTheme();

  return (
    <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 shrink-0">
      <div className="ml-auto flex items-center gap-2">
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
        <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell size={15} />
        </button>
        <button aria-label="Settings" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Settings size={15} />
        </button>
        <button onClick={toggle} aria-label="Toggle theme" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer select-none">
          U
        </div>
      </div>
    </header>
  );
};
