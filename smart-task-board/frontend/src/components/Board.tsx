import { useState, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Task, Status } from '../types/task';
import type { Page } from '../types/navigation';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { TaskDetail } from './TaskDetail';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MyTasksPage } from '../pages/MyTasksPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { TrashPage } from '../pages/TrashPage';
import { useTasks } from '../hooks/useTasks';

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

  const allTasks = localTasks.length ? localTasks : tasks;
  const displayTasks = allTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const getTasksByStatus = (s: Status) => displayTasks.filter(t => t.status === s);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') setEditingTask(null);
      if (e.key === 'Escape') { setEditingTask(undefined); setDetailTask(null); }
      if (e.key === '/' ) { e.preventDefault(); document.querySelector<HTMLInputElement>('input[aria-label="Search tasks"]')?.focus(); }
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
        return <MyTasksPage tasks={tasks} onEdit={t => setEditingTask(t)} onDelete={removeTask} onAdd={() => setEditingTask(null)} onOpenDetail={setDetailTask} />;
      case 'analytics':
        return <AnalyticsPage tasks={tasks} />;
      case 'archive':
        return <ArchivePage tasks={tasks} onRestore={id => editTask(id, { status: 'inprogress' })} />;
      case 'trash':
        return <TrashPage tasks={trashed} onRestore={restoreTask} onPermanentDelete={permanentDelete} />;
      default:
        return (
          <div className="px-8 py-7">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Active Workspace</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track your tasks. Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">N</kbd> to create, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">/</kbd> to search.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <SlidersHorizontal size={13} /> Filter
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <ArrowUpDown size={13} /> Sort
                </button>
              </div>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATUSES.map(status => (
                  <Column key={status} status={status} tasks={getTasksByStatus(status)}
                    onEdit={t => setEditingTask(t)} onDelete={removeTask}
                    onAdd={() => setEditingTask(null)} onOpenDetail={setDetailTask} />
                ))}
              </div>
            </DndContext>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} trashedCount={trashed.length} onNewTask={() => setEditingTask(null)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar search={search} onSearch={setSearch} />
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
