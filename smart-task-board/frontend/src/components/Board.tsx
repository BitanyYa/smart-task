import { useState, useEffect } from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Plus, ArrowRight } from 'lucide-react';
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
import { useTasks } from '../hooks/useTasks';
import { isPast, formatDistanceToNow } from 'date-fns';

const STATUSES: Status[] = ['todo', 'inprogress', 'done'];

export const Board = () => {
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
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
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
      default: {
        const done = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'inprogress').length;
        const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done');
        const recent = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        return (
          <div className="px-8 py-7">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here's what's happening.</p>
              </div>
              <button onClick={() => setEditingTask(null)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <Plus size={14} /> New Task
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: ListTodo,      label: 'Total Tasks', value: tasks.length,   color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
                { icon: Clock,         label: 'In Progress', value: inProgress,     color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
                { icon: CheckCircle2,  label: 'Completed',   value: done,           color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
                { icon: AlertTriangle, label: 'Overdue',     value: overdue.length, color: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recent tasks */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
                  <button onClick={() => setActivePage('my-tasks')} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    View all <ArrowRight size={11} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recent.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No tasks yet</p>}
                  {recent.map(t => (
                    <div key={t.id} onClick={() => setDetailTask(t)}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'done' ? 'bg-emerald-400' : t.status === 'inprogress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <p className={`text-sm font-medium truncate ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{t.title}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-3">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overdue */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Overdue Tasks</h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overdue.length > 0 ? 'bg-red-100 dark:bg-red-950/40 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {overdue.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {overdue.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-1">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <p className="text-sm text-gray-400">All caught up!</p>
                    </div>
                  )}
                  {overdue.slice(0, 5).map(t => (
                    <div key={t.id} onClick={() => setDetailTask(t)}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                      <span className="text-xs text-red-500 font-medium shrink-0 ml-3">
                        {formatDistanceToNow(new Date(t.dueDate!), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
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
