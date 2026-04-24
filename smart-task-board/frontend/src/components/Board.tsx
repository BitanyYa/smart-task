import { useState } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Task, Status } from '../types/task';
import type { Page } from '../types/navigation';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MyTasksPage } from '../pages/MyTasksPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { TrashPage } from '../pages/TrashPage';
import { useTasks } from '../hooks/useTasks';

const STATUSES: Status[] = ['todo', 'inprogress', 'done'];

export const Board = () => {
  const { tasks, trashed, loading, error, addTask, editTask, removeTask, restoreTask, permanentDelete } = useTasks();
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState<Page>('board');
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const allTasks = localTasks.length ? localTasks : tasks;

  const displayTasks = allTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const getTasksByStatus = (status: Status) => displayTasks.filter(t => t.status === status);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const source = (localTasks.length ? localTasks : tasks);
    const activeTask = source.find(t => t.id === activeId);
    if (!activeTask) return;

    const overStatus = STATUSES.includes(overId as Status)
      ? (overId as Status)
      : source.find(t => t.id === overId)?.status;

    if (!overStatus || activeTask.status === overStatus) return;

    // Move card to new column optimistically
    setLocalTasks(source.map(t =>
      t.id === activeId ? { ...t, status: overStatus } : t
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !localTasks.length) {
      setLocalTasks([]);
      return;
    }

    const activeId = active.id as string;
    const snapshot = [...localTasks];
    const activeTask = snapshot.find(t => t.id === activeId);
    const originalTask = tasks.find(t => t.id === activeId);

    if (!activeTask || !originalTask) {
      setLocalTasks([]);
      return;
    }

    // If status actually changed, persist to backend
    if (activeTask.status !== originalTask.status) {
      // Keep localTasks in place while API call happens
      editTask(activeId, { status: activeTask.status }).then(() => {
        setLocalTasks([]); // clear only after backend confirms
      }).catch(() => {
        setLocalTasks([]); // revert on error
      });
    } else {
      setLocalTasks([]);
    }
  };

  const handleSave = async (dto: Parameters<typeof addTask>[0]) => {
    if (editingTask) {
      await editTask(editingTask.id, dto);
    } else {
      await addTask(dto);
    }
    setLocalTasks([]);
    setEditingTask(undefined);
  };

  const handleRestoreFromArchive = async (id: string) => {
    await editTask(id, { status: 'inprogress' });
  };

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
          <MyTasksPage
            tasks={tasks}
            onEdit={task => setEditingTask(task)}
            onDelete={removeTask}
            onAdd={() => setEditingTask(null)}
          />
        );
      case 'analytics':
        return <AnalyticsPage tasks={tasks} />;
      case 'archive':
        return <ArchivePage tasks={tasks} onRestore={handleRestoreFromArchive} />;
      case 'trash':
        return (
          <TrashPage
            tasks={trashed}
            onRestore={restoreTask}
            onPermanentDelete={permanentDelete}
          />
        );
      default:
        return (
          <div className="flex-1 overflow-y-auto px-8 py-7">
            {/* Page header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Active Workspace</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage and track your team's progress across current projects.
                </p>
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
                  <Column
                    key={status}
                    status={status}
                    tasks={getTasksByStatus(status)}
                    onEdit={task => setEditingTask(task)}
                    onDelete={removeTask}
                    onAdd={() => setEditingTask(null)}
                  />
                ))}
              </div>
            </DndContext>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        trashedCount={trashed.length}
        onNewTask={() => setEditingTask(null)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar search={search} onSearch={setSearch} />
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </div>

      {editingTask !== undefined && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
