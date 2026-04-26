import { useState } from 'react';
import { X, Send, Trash2, Clock, Play, Square, Tag, Activity, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';

interface Props {
  task: Task;
  onClose: () => void;
  onAddComment: (taskId: string, text: string) => void;
  onDeleteComment: (taskId: string, commentId: string) => void;
  onToggleTimer: (task: Task) => void;
}

function getTotalTime(task: Task): string {
  let ms = 0;
  for (const e of task.timeEntries) {
    const start = new Date(e.startedAt).getTime();
    const end = e.stoppedAt ? new Date(e.stoppedAt).getTime() : Date.now();
    ms += end - start;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

type Tab = 'comments' | 'activity' | 'timer';

export const TaskDetail = ({ task, onClose, onAddComment, onDeleteComment, onToggleTimer }: Props) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('comments');
  const [comment, setComment] = useState('');

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddComment(task.id, comment.trim());
    setComment('');
  };

  const tabCls = (t: Tab) =>
    `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-cream-100 dark:bg-neutral-900 rounded-2xl shadow-xl border border-cream-300 dark:border-neutral-800 w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-cream-200 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-neutral-800 dark:text-cream-100 leading-snug">{task.title}</h2>
              {task.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{task.description}</p>}
              {task.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {task.labels.map(l => (
                    <span key={l} className="flex items-center gap-1 text-xs bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                      <Tag size={10} />{l}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-gray-600 hover:bg-cream-200 dark:hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 transition-colors shrink-0">
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 -mb-px">
            <button className={tabCls('comments')} onClick={() => setTab('comments')}>
              <MessageSquare size={13} /> Comments ({task.comments?.length || 0})
            </button>
            <button className={tabCls('activity')} onClick={() => setTab('activity')}>
              <Activity size={13} /> Activity
            </button>
            <button className={tabCls('timer')} onClick={() => setTab('timer')}>
              <Clock size={13} /> Timer
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Comments */}
          {tab === 'comments' && (
            <div className="flex flex-col gap-3">
              {task.comments?.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-6">No comments yet</p>
              )}
              {task.comments?.map(c => (
                <div key={c._id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{c.user?.name}</span>
                      <span className="text-xs text-neutral-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-cream-200 dark:bg-neutral-950 rounded-xl px-3 py-2">{c.text}</p>
                  </div>
                  {user?._id === c.user?._id && (
                    <button onClick={() => onDeleteComment(task.id, c._id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shrink-0 mt-5">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Activity */}
          {tab === 'activity' && (
            <div className="flex flex-col gap-2">
              {task.activityLog?.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-6">No activity yet</p>
              )}
              {[...( task.activityLog || [])].reverse().map(a => (
                <div key={a._id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5">
                    {a.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium">{a.user?.name}</span> {a.action}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timer */}
          {tab === 'timer' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-4xl font-bold text-neutral-800 dark:text-cream-100 font-mono">
                {getTotalTime(task)}
              </div>
              <button
                onClick={() => onToggleTimer(task)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors shadow-sm ${
                  task.isTimerRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {task.isTimerRunning ? <><Square size={16} /> Stop Timer</> : <><Play size={16} /> Start Timer</>}
              </button>
              {task.timeEntries?.length > 0 && (
                <div className="w-full">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Sessions</p>
                  <div className="flex flex-col gap-1.5">
                    {task.timeEntries.map((e, i) => (
                      <div key={i} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 bg-cream-200 dark:bg-neutral-950 rounded-lg px-3 py-2">
                        <span>{format(new Date(e.startedAt), 'MMM d, HH:mm')}</span>
                        <span>{e.stoppedAt ? format(new Date(e.stoppedAt), 'HH:mm') : '⏱ running'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment input */}
        {tab === 'comments' && (
          <form onSubmit={handleComment} className="px-6 py-4 border-t border-cream-200 dark:border-neutral-800 flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-cream-200 dark:bg-neutral-950 border border-cream-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 dark:focus:border-primary-600 transition-all text-neutral-800 dark:text-cream-100 placeholder-gray-400"
            />
            <button type="submit" className="w-9 h-9 flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shrink-0">
              <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};



