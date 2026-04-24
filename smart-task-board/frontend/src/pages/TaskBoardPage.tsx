import { useState } from 'react';
import { DndContext, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { isPast } from 'date-fns';
import { FilterSortPanel } from '../components/FilterSortPanel';
import type { FilterState, SortState } from '../components/FilterSortPanel';
import { Column } from '../components/Column';
import type { Task, Status } from '../types/task';

const STATUSES: Status[] = ['todo', 'inprogress', 'done'];

interface Props {
  tasks: Task[];
  localTasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (task: Task) => void;
  onAdd: () => void;
  onDragOver: (e: DragOverEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
}

export const TaskBoardPage = ({ tasks, localTasks, onEdit, onDelete, onOpenDetail, onAdd, onDragOver, onDragEnd }: Props) => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filter, setFilter] = useState<FilterState>({ priorities: [], statuses: [], labels: [], overdue: false });
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', dir: 'desc' });

  const allTasks = localTasks.length ? localTasks : tasks;
  const availableLabels = [...new Set(tasks.flatMap(t => t.labels || []))];
  const activeFilterCount = filter.priorities.length + filter.statuses.length + filter.labels.length + (filter.overdue ? 1 : 0);

  const applyFilter = (list: Task[]) => list.filter(t => {
    if (filter.priorities.length && !filter.priorities.includes(t.priority)) return false;
    if (filter.statuses.length && !filter.statuses.includes(t.status)) return false;
    if (filter.labels.length && !filter.labels.some(l => t.labels?.includes(l))) return false;
    if (filter.overdue && (!t.dueDate || !isPast(new Date(t.dueDate)) || t.status === 'done')) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const applySort = (list: Task[]) => [...list].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.field === 'title') return dir * a.title.localeCompare(b.title);
    if (sort.field === 'priority') return dir * ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]);
    if (sort.field === 'dueDate') {
      if (!a.dueDate) return 1; if (!b.dueDate) return -1;
      return dir * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  const displayTasks = applySort(applyFilter(allTasks));
  const getByStatus = (s: Status) => displayTasks.filter(t => t.status === s);

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Task Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track your tasks. Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">N</kbd> to create.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowFilter(p => !p); setShowSort(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border rounded-lg transition-colors shadow-sm ${
                activeFilterCount > 0
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilter && (
              <FilterSortPanel mode="filter" filter={filter} sort={sort} availableLabels={availableLabels}
                onFilterChange={setFilter} onSortChange={setSort} onClose={() => setShowFilter(false)} />
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setShowSort(p => !p); setShowFilter(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border rounded-lg transition-colors shadow-sm ${
                sort.field !== 'createdAt' || sort.dir !== 'desc'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown size={13} />
              Sort
            </button>
            {showSort && (
              <FilterSortPanel mode="sort" filter={filter} sort={sort} availableLabels={availableLabels}
                onFilterChange={setFilter} onSortChange={setSort} onClose={() => setShowSort(false)} />
            )}
          </div>

          {/* New Task */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban using the same Column + TaskCard components */}
      <DndContext collisionDetection={closestCorners} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUSES.map(status => (
            <Column
              key={status}
              status={status}
              tasks={getByStatus(status)}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
