import { useState } from 'react';
import { List, Calendar, Tag, MoreHorizontal, CheckCircle2, Clock, Trash2, Pencil } from 'lucide-react';
import { format, isPast } from 'date-fns';
import type { Task, Priority } from '../types/task';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (task: Task) => void;
  onAdd: () => void;
}

const priorityColors = {
  high:   'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
  medium: 'text-sage-600 bg-sage-50 dark:bg-sage-950/20',
  low:    'text-neutral-500 bg-cream-300 dark:bg-neutral-800',
};

export const TaskListPage = ({ tasks, onEdit, onDelete, onOpenDetail, onAdd }: Props) => {
  const [search, setSearch] = useState('');
  
  const filtered = tasks.filter(t => 
    !t.deletedAt && 
    (t.title.toLowerCase().includes(search.toLowerCase()) || 
     t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">Tasks</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Detailed list of all your workspace tasks.</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 flex items-center gap-2 bg-cream-100 dark:bg-neutral-900 border border-cream-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary-400/30 transition-all shadow-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search all tasks..." className="bg-transparent outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 w-full" />
        </div>
      </div>

      <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl border border-cream-300 dark:border-neutral-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cream-300 dark:border-neutral-800">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Task Name</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Status</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Priority</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Due Date</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 dark:divide-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">No tasks found</td>
              </tr>
            ) : filtered.map(task => (
              <tr key={task.id} className="group hover:bg-cream-200/50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4" onClick={() => onOpenDetail(task)}>
                  <div className="flex flex-col cursor-pointer">
                    <span className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-cream-100'}`}>{task.title}</span>
                    {task.description && <span className="text-xs text-neutral-400 truncate max-w-xs">{task.description}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-sage-500' : task.status === 'inprogress' ? 'bg-primary-500' : 'bg-neutral-400'}`} />
                    <span className="text-xs font-semibold capitalize text-neutral-600 dark:text-neutral-400">{task.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 text-xs ${task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'text-primary-600 font-bold' : 'text-neutral-500'}`}>
                    <Calendar size={12} />
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(task)} className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      <Trash2 size={14} />
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
