import { LayoutDashboard, ListTodo, BarChart2, Archive, Trash2, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import type { Page } from '../types/navigation';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  trashedCount: number;
  onNewTask: () => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'board',     label: 'Board',    icon: LayoutDashboard },
  { id: 'my-tasks',  label: 'My Tasks', icon: ListTodo },
  { id: 'analytics', label: 'Analytics',icon: BarChart2 },
];

const bottomItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash',   label: 'Trash',   icon: Trash2 },
];

export const Sidebar = ({ activePage, onNavigate, trashedCount, onNewTask }: Props) => {
  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">Smart Task</p>
            <p className="text-[11px] text-gray-400">Professional Plan</p>
          </div>
        </div>

        <button
          onClick={onNewTask}
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium py-2 rounded-lg transition-all"
        >
          <span className="text-base leading-none">+</span>
          Create Task
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
            >
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {active && <ChevronRight size={13} className="shrink-0 opacity-60" />}
            </button>
          );
        })}

        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

        {bottomItems.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
            >
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'trash' && trashedCount > 0 && (
                <span className="text-[11px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-500 px-1.5 py-0.5 rounded-full">
                  {trashedCount}
                </span>
              )}
              {active && <ChevronRight size={13} className="shrink-0 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left font-medium">
          <HelpCircle size={15} />
          Help Center
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium">
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
};
