import { useEffect, useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import type { Task, CreateTaskDto, Priority, Status } from '../types/task';
import { useAuth } from '../context/AuthContext';
import { fetchProjects } from '../api/projects';
import type { Project } from '../api/projects';

interface Props {
  task?: Task | null;
  onClose: () => void;
  onSave: (dto: CreateTaskDto) => void;
}

export const TaskModal = ({ task, onClose, onSave }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(() => (user?.workspaceSettings?.defaultPriority?.toLowerCase() as Priority) || 'medium');
  const [status, setStatus] = useState<Status>('todo');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily'|'weekly'|'monthly'>('weekly');
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setLabels(task.labels || []);
      setIsRecurring(task.isRecurring || false);
      setRecurringInterval(task.recurringInterval || 'weekly');
      setProjectId((task as any).project?._id || (task as any).project || '');
    }
  }, [task]);

  const addLabel = () => {
    const l = labelInput.trim();
    if (l && !labels.includes(l)) setLabels(prev => [...prev, l]);
    setLabelInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(), description, priority, status,
      dueDate: dueDate || undefined,
      labels,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      project: projectId || null,
    });
    onClose();
  };

  const inputCls = "w-full bg-cream-100 dark:bg-neutral-900 border border-cream-400 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-cream-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-neutral-700 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-400 dark:border-neutral-700 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 sticky top-0 bg-cream-100 dark:bg-neutral-900 border-b border-cream-300 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-cream-100">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus required className={inputCls} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details..." rows={3} className={`${inputCls} resize-none`} />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Status)} className={inputCls}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
          </div>

          {/* Project */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Project <span className="text-neutral-300 dark:text-neutral-600">(optional)</span></label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className={inputCls}>
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Labels</label>
            <div className="flex gap-2">
              <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); }}}
                placeholder="Add label..." className={`${inputCls} flex-1`} />
              <button type="button" onClick={addLabel} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Plus size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {labels.map(l => (
                  <span key={l} className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    <Tag size={10} />{l}
                    <button type="button" onClick={() => setLabels(prev => prev.filter(x => x !== l))} className="ml-0.5 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Recurring task</label>
            {isRecurring && (
              <select value={recurringInterval} onChange={e => setRecurringInterval(e.target.value as any)}
                className="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 outline-none">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-sm">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



