import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Task, CreateTaskDto, Priority, Status } from '../types/task';

interface Props {
  task?: Task | null;
  onClose: () => void;
  onSave: (dto: CreateTaskDto) => void;
}

export const TaskModal = ({ task, onClose, onSave }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, priority, status });
    onClose();
  };

  const inputCls = [
    'w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200',
    'bg-gray-50/80 dark:bg-gray-800/80',
    'border border-gray-200/80 dark:border-gray-700',
    'text-gray-800 dark:text-gray-200',
    'placeholder-gray-400 dark:placeholder-gray-600',
    'focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-gray-800',
  ].join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-gray-900 border border-white/80 dark:border-gray-700/60 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

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

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-300/40"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
