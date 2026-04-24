import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Priority, Status } from '../types/task';

export type SortField = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortDir = 'asc' | 'desc';

export type FilterState = {
  priorities: Priority[];
  statuses: Status[];
  labels: string[];
  overdue: boolean;
};

export type SortState = {
  field: SortField;
  dir: SortDir;
};

interface Props {
  mode: 'filter' | 'sort';
  filter: FilterState;
  sort: SortState;
  availableLabels: string[];
  onFilterChange: (f: FilterState) => void;
  onSortChange: (s: SortState) => void;
  onClose: () => void;
}

const priorities: Priority[] = ['high', 'medium', 'low'];
const statuses: Status[] = ['todo', 'inprogress', 'done'];
const statusLabels: Record<Status, string> = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const sortFields: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'dueDate',   label: 'Due Date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'title',     label: 'Title' },
];

const pillCls = (active: boolean) =>
  `px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors select-none ${
    active
      ? 'bg-blue-600 border-blue-600 text-white'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
  }`;

export const FilterSortPanel = ({ mode, filter, sort, availableLabels, onFilterChange, onSortChange, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const togglePriority = (p: Priority) => {
    const next = filter.priorities.includes(p)
      ? filter.priorities.filter(x => x !== p)
      : [...filter.priorities, p];
    onFilterChange({ ...filter, priorities: next });
  };

  const toggleStatus = (s: Status) => {
    const next = filter.statuses.includes(s)
      ? filter.statuses.filter(x => x !== s)
      : [...filter.statuses, s];
    onFilterChange({ ...filter, statuses: next });
  };

  const toggleLabel = (l: string) => {
    const next = filter.labels.includes(l)
      ? filter.labels.filter(x => x !== l)
      : [...filter.labels, l];
    onFilterChange({ ...filter, labels: next });
  };

  const activeFilterCount =
    filter.priorities.length + filter.statuses.length + filter.labels.length + (filter.overdue ? 1 : 0);

  return (
    <div ref={ref} className="absolute top-10 right-0 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {mode === 'filter' ? 'Filter Tasks' : 'Sort Tasks'}
        </span>
        <div className="flex items-center gap-2">
          {mode === 'filter' && activeFilterCount > 0 && (
            <button
              onClick={() => onFilterChange({ priorities: [], statuses: [], labels: [], overdue: false })}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {mode === 'filter' && (
          <>
            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Priority</p>
              <div className="flex gap-2 flex-wrap">
                {priorities.map(p => (
                  <span key={p} onClick={() => togglePriority(p)} className={pillCls(filter.priorities.includes(p))}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2 flex-wrap">
                {statuses.map(s => (
                  <span key={s} onClick={() => toggleStatus(s)} className={pillCls(filter.statuses.includes(s))}>
                    {statusLabels[s]}
                  </span>
                ))}
              </div>
            </div>

            {/* Labels */}
            {availableLabels.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Labels</p>
                <div className="flex gap-2 flex-wrap">
                  {availableLabels.map(l => (
                    <span key={l} onClick={() => toggleLabel(l)} className={pillCls(filter.labels.includes(l))}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Overdue only</span>
              <button
                onClick={() => onFilterChange({ ...filter, overdue: !filter.overdue })}
                className={`relative w-10 h-5 rounded-full transition-colors ${filter.overdue ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filter.overdue ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </>
        )}

        {mode === 'sort' && (
          <>
            {/* Sort field */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sort By</p>
              <div className="flex flex-col gap-1">
                {sortFields.map(f => (
                  <button
                    key={f.value}
                    onClick={() => onSortChange({ ...sort, field: f.value })}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      sort.field === f.value
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {f.label}
                    {sort.field === f.value && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Direction</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSortChange({ ...sort, dir: 'asc' })}
                  className={pillCls(sort.dir === 'asc')}
                >
                  Ascending ↑
                </button>
                <button
                  onClick={() => onSortChange({ ...sort, dir: 'desc' })}
                  className={pillCls(sort.dir === 'desc')}
                >
                  Descending ↓
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
