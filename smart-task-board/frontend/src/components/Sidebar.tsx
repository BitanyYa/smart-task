import { LayoutDashboard, ListTodo, BarChart2, Archive, Trash2, HelpCircle, LogOut, ChevronRight, Users, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';import type { Page } from '../types/navigation';

interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  trashedCount: number;
  onNewTask: () => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'board',    label: 'Board',    icon: LayoutDashboard },
  { id: 'my-tasks', label: 'Tasks',    icon: ListTodo },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'analytics',label: 'Analytics',icon: BarChart2 },
  { id: 'teams',    label: 'Teams',    icon: Users },
];

const bottomItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash',   label: 'Trash',   icon: Trash2 },
];

export const Sidebar = ({ activePage, onNavigate, trashedCount, onNewTask }: Props) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="w-56 shrink-0 bg-cream-200 dark:bg-neutral-950 border-r border-cream-400 dark:border-neutral-700 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-cream-400 dark:border-neutral-700">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-800 dark:text-cream-100 tracking-tight leading-none">Smart Task</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Shared Studio</p>
          </div>
        </div>

        <button onClick={onNewTask}
          className="w-full flex items-center justify-center gap-1.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm">
          <span className="text-base leading-none">+</span> New Task
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                active
                  ? 'bg-primary-500 text-white font-semibold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-cream-100 font-medium'
              }`}>
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {active && <ChevronRight size={13} className="shrink-0 opacity-70" />}
            </button>
          );
        })}

        <div className="h-px bg-cream-400 my-2" />

        {bottomItems.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                active
                  ? 'bg-primary-500 text-white font-semibold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-cream-100 font-medium'
              }`}>
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'trash' && trashedCount > 0 && (
                <span className="text-[11px] font-bold bg-red-100 dark:bg-red-950/40 text-red-500 px-1.5 py-0.5 rounded-full">{trashedCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-cream-400 dark:border-neutral-700 flex flex-col gap-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-cream-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800 transition-colors text-left font-medium">
          <HelpCircle size={15} /> Support
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
};



