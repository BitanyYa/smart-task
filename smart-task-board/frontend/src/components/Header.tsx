import { Sun, Moon, Plus, Search, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  onNewTask: () => void;
  trashedCount: number;
  onOpenTrash: () => void;
}

export const Header = ({ search, onSearch, onNewTask, trashedCount, onOpenTrash }: Props) => {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/60 dark:border-gray-800 shadow-sm shadow-gray-100/80 dark:shadow-gray-900">
      <div className="max-w-6xl mx-auto px-8 py-3.5 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Smart Task Board</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400/30 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 w-40 text-sm"
              aria-label="Search tasks"
            />
          </div>

          <button
            onClick={onOpenTrash}
            aria-label="Open trash"
            className="relative w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 transition-all duration-200"
          >
            <Trash2 size={14} />
            {trashedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {trashedCount > 9 ? '9+' : trashedCount}
              </span>
            )}
          </button>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200/70 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-300/50 hover:shadow-md hover:shadow-indigo-300/50"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Task
          </button>
        </div>
      </div>
    </header>
  );
};



