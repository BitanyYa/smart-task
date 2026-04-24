import { useState } from 'react';
import { Pencil, Trash2, Calendar, ChevronDown } from 'lucide-react';
import type { Task, Status, Priority } from '../types/task';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const priorityColors: Record<Priority, string> = {
  high:   'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  low:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const statusColors: Record<Status, string> = {
  todo:       'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inprogress: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  done:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const statusLabels: Record<Status, string> = {
  todo: 'To Do', inprogress: 'In Progress', done: 'Done',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const MyTasksPage = ({ tasks, onEdit, onDelete, onAdd }: Props) => {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">My Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your tasks in one place.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as Status | 'all')}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-400/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-400/30 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-sm text-gray-400 ml-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-gray-400">No tasks found</td>
              </tr>
            ) : filtered.map(task => (
              <tr key={task.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md capitalize ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11} />
                    {formatDate(task.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <button onClick={() => onEdit(task)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
