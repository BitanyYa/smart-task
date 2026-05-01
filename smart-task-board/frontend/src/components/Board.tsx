import { useState, useEffect } from 'react';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { Plus, Calendar } from 'lucide-react';
import type { Task, Status } from '../types/task';
import type { Page } from '../types/navigation';
import { TaskModal } from './TaskModal';
import { TaskDetail } from './TaskDetail';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { TrashPage } from '../pages/TrashPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TeamsPage } from '../pages/TeamsPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { TaskBoardPage } from '../pages/TaskBoardPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { isPast, format } from 'date-fns';

const STATUSES: Status[] = ['todo', 'inprogress', 'done'];

export const Board = () => {
  const { user } = useAuth();
  const {
    tasks, trashed, loading, error,
    addTask, editTask, removeTask, restoreTask, permanentDelete,
    toggleTimer, addComment, deleteComment,
  } = useTasks();

  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState<Page>('board');
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') setEditingTask(null);
      if (e.key === 'Escape') { setEditingTask(undefined); setDetailTask(null); }
      if (e.key === '/') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[aria-label="Search tasks"]')?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    const source = localTasks.length ? localTasks : tasks;
    const activeTask = source.find(t => t.id === activeId);
    if (!activeTask) return;
    const overStatus = STATUSES.includes(overId as Status)
      ? (overId as Status)
      : source.find(t => t.id === overId)?.status;
    if (!overStatus || activeTask.status === overStatus) return;
    setLocalTasks(source.map(t => t.id === activeId ? { ...t, status: overStatus } : t));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    if (!localTasks.length) return;
    const activeId = active.id as string;
    const activeTask = localTasks.find(t => t.id === activeId);
    const originalTask = tasks.find(t => t.id === activeId);
    if (!activeTask || !originalTask) { setLocalTasks([]); return; }
    if (activeTask.status !== originalTask.status) {
      editTask(activeId, { status: activeTask.status }).then(() => setLocalTasks([])).catch(() => setLocalTasks([]));
    } else {
      setLocalTasks([]);
    }
  };

  const handleSave = async (dto: Parameters<typeof addTask>[0]) => {
    if (editingTask) await editTask(editingTask.id, dto);
    else await addTask(dto);
    setLocalTasks([]);
    setEditingTask(undefined);
  };

  // Sync detailTask when tasks update
  useEffect(() => {
    if (detailTask) {
      const updated = tasks.find(t => t.id === detailTask.id);
      if (updated) setDetailTask(updated);
    }
  }, [tasks]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-cream-200 dark:bg-neutral-950">
      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-cream-200 dark:bg-neutral-950">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'my-tasks':
        return (
          <TaskBoardPage
            tasks={tasks}
            localTasks={localTasks}
            onEdit={t => setEditingTask(t)}
            onDelete={removeTask}
            onOpenDetail={setDetailTask}
            onAdd={() => setEditingTask(null)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        );
      case 'analytics':
        return <AnalyticsPage tasks={tasks} />;
      case 'archive':
        return <ArchivePage tasks={tasks} onRestore={id => editTask(id, { status: 'inprogress' })} />;
      case 'trash':
        return <TrashPage tasks={trashed} onRestore={restoreTask} onPermanentDelete={permanentDelete} />;
      case 'settings':
      case 'profile':
        return <SettingsPage />;
      case 'teams':
        return <TeamsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={setActivePage} />;
      default: {
        const todo       = tasks.filter(t => t.status === 'todo');
        const inProg     = tasks.filter(t => t.status === 'inprogress');
        const done       = tasks.filter(t => t.status === 'done');
        const overdue    = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
        const hour       = new Date().getHours();
        const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const activeProj = tasks.length > 0 ? Math.ceil(tasks.length / 3) : 0;

        const inspirations = [
          { quote: '"Design is not just what it looks like and feels like. Design is how it works."', author: '— Steve Jobs' },
          { quote: '"The best way to predict the future is to create it."', author: '— Peter Drucker' },
          { quote: '"Done is better than perfect."', author: '— Sheryl Sandberg' },
        ];
        const inspiration = inspirations[new Date().getDay() % inspirations.length];

        // Theme-only avatar colors using primary/sage/neutral palette
        const avatarColors = ['bg-primary-500','bg-sage-500','bg-primary-400','bg-sage-400','bg-primary-600'];

        const MiniCard = ({ task }: { task: Task }) => (
          <div onClick={() => setDetailTask(task)}
            className="bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            {task.labels?.length > 0 && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cream-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 mb-2">
                {task.labels[0]}
              </span>
            )}
            <p className={`text-sm font-bold leading-snug mb-1.5 ${task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-cream-100'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-3">{task.description}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                {task.dueDate && <><Calendar size={10} />{format(new Date(task.dueDate), 'MMM d')}</>}
                {task.priority === 'high' && !task.dueDate && <span className="text-primary-500 font-semibold">High Priority</span>}
                {task.status === 'done' && <span className="text-sage-500 font-semibold">Shippable</span>}
              </div>
              <div className={`w-6 h-6 rounded-full ${avatarColors[task.title.length % avatarColors.length]} flex items-center justify-center text-white text-[10px] font-bold`}>U</div>
            </div>
          </div>
        );

        const ColSection = ({ label, count, dot, tasks: colTasks }: { label: string; count: number; dot: string; tasks: Task[] }) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{label}</span>
              <span className="text-xs font-bold bg-neutral-800 dark:bg-cream-200 dark:bg-neutral-950 text-white dark:text-neutral-800 dark:text-cream-100 px-1.5 py-0.5 rounded-full">{count}</span>
              <button onClick={() => setEditingTask(null)}
                className="ml-auto w-5 h-5 flex items-center justify-center rounded-full border border-cream-400 dark:border-neutral-600 text-neutral-400 hover:text-primary-500 hover:border-primary-400 transition-colors">
                <Plus size={11} />
              </button>
            </div>
            {colTasks.slice(0, 2).map(t => <MiniCard key={t.id} task={t} />)}
            {colTasks.length === 0 && (
              <div className="flex items-center justify-center h-16 border-2 border-dashed border-cream-400 dark:border-neutral-700 rounded-xl text-xs text-neutral-300">
                No tasks
              </div>
            )}
          </div>
        );

        return (
          <div className="px-8 py-7 space-y-6">
            {/* Greeting row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">
                  {greeting}, {user?.name?.split(' ')[0]}.
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  You have {inProg.length} task{inProg.length !== 1 ? 's' : ''} in progress{overdue.length > 0 ? ` and ${overdue.length} overdue` : ''} today.
                </p>
              </div>
              <div className="bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
                <span className="text-xl">😊</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Team Mood</p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-cream-100">Feeling Productive</p>
                </div>
                <div className="flex -space-x-1.5 ml-2">
                  {['bg-primary-500','bg-sage-500','bg-primary-400'].map((c, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-white text-[9px] font-bold`}>U</div>
                  ))}
                  <div className="w-6 h-6 rounded-full bg-cream-300 dark:bg-neutral-700 border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-[9px] font-bold">+{Math.max(0, tasks.length - 3)}</div>
                </div>
              </div>
            </div>

            {/* Daily inspiration */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 rounded-xl px-6 py-5 shadow-sm flex items-center justify-between gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-primary-300 dark:text-primary-700 leading-none mt-0.5">"</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500 mb-1.5">Daily Inspiration</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 italic leading-relaxed">{inspiration.quote}</p>
                  <p className="text-xs text-neutral-400 mt-1">{inspiration.author}</p>
                </div>
              </div>
              <button onClick={() => setActivePage('teams')}
                className="shrink-0 px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-cream-200 dark:bg-neutral-950 hover:bg-cream-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                Share with Team
              </button>
            </div>

            {/* Mini kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColSection label="Backlog"     count={todo.length}   dot="bg-neutral-400"  tasks={todo} />
              <ColSection label="In Progress" count={inProg.length} dot="bg-primary-500"  tasks={inProg} />
              <ColSection label="Ready"       count={done.length}   dot="bg-sage-500"     tasks={done} />
            </div>

            {/* Collaborators */}
            <div className="bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 rounded-xl px-6 py-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['bg-primary-500','bg-sage-500','bg-primary-400','bg-sage-400','bg-primary-600'].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-white text-xs font-bold`}>U</div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-cream-300 dark:bg-neutral-700 border-2 border-cream-100 dark:border-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-xs font-bold">+{Math.max(0, tasks.length)}</div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Collaborators</p>
                  <p className="text-sm font-bold text-neutral-800 dark:text-cream-100">{tasks.length} Tasks active</p>
                  <p className="text-xs text-neutral-400">{activeProj} project stream{activeProj !== 1 ? 's' : ''} running</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setActivePage('teams')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 border border-cream-400 dark:border-neutral-600 rounded-lg hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-700 transition-colors">
                  Manage Roles
                </button>
                <button onClick={() => setActivePage('teams')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors shadow-sm">
                  <Plus size={13} /> Invite Team
                </button>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-screen bg-cream-200 dark:bg-neutral-950 overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} trashedCount={trashed.length} onNewTask={() => setEditingTask(null)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar search={search} onSearch={setSearch} tasks={tasks} onNavigate={setActivePage} />
        <div className="flex-1 overflow-y-auto">{renderPage()}</div>
      </div>

      {editingTask !== undefined && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(undefined)} onSave={handleSave} />
      )}

      {detailTask && (
        <TaskDetail
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onToggleTimer={toggleTimer}
        />
      )}
    </div>
  );
};





