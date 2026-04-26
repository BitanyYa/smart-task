import { CheckCircle2, Clock, ListTodo, Flame } from 'lucide-react';
import type { Task } from '../types/task';

interface Props { tasks: Task[] }

export const AnalyticsPage = ({ tasks }: Props) => {
  const total      = tasks.length;
  const todo       = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const high       = tasks.filter(t => t.priority === 'high').length;
  const medium     = tasks.filter(t => t.priority === 'medium').length;
  const low        = tasks.filter(t => t.priority === 'low').length;
  const doneRate   = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Total Tasks',   value: total,      icon: ListTodo,    color: 'bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
    { label: 'In Progress',   value: inProgress, icon: Clock,       color: 'bg-cream-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' },
    { label: 'Completed',     value: done,       icon: CheckCircle2,color: 'bg-sage-100 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400' },
    { label: 'High Priority', value: high,       icon: Flame,       color: 'bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
  ];

  const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="w-full bg-cream-300 dark:bg-neutral-800 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }} />
    </div>
  );

  const card = "bg-cream-100 dark:bg-neutral-900 rounded-xl border border-cream-300 dark:border-neutral-800 p-6 shadow-sm";

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-cream-100 tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Overview of your task performance and progress.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={card}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={17} />
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-cream-100">{s.value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={card}>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-cream-100 mb-4">Completion Rate</h2>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-neutral-800 dark:text-cream-100">{doneRate}%</span>
            <span className="text-sm text-neutral-400 mb-1">of tasks done</span>
          </div>
          <Bar value={done} max={total} color="bg-sage-500" />
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>{done} completed</span><span>{total - done} remaining</span>
          </div>
        </div>

        <div className={card}>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-cream-100 mb-4">Status Breakdown</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Backlog',     value: todo,       color: 'bg-neutral-400' },
              { label: 'In Progress', value: inProgress, color: 'bg-primary-500' },
              { label: 'Done',        value: done,       color: 'bg-sage-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
                  <span className="text-neutral-400">{item.value}</span>
                </div>
                <Bar value={item.value} max={total} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-cream-100 mb-4">Priority Breakdown</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'High',   value: high,   color: 'bg-primary-500' },
              { label: 'Medium', value: medium, color: 'bg-cream-500' },
              { label: 'Low',    value: low,    color: 'bg-sage-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
                  <span className="text-neutral-400">{item.value}</span>
                </div>
                <Bar value={item.value} max={total} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-cream-100 mb-4">Recent Tasks</h2>
          <div className="flex flex-col gap-2.5">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between gap-3">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate font-medium">{task.title}</p>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                  task.status === 'done'       ? 'bg-sage-100 text-sage-600 dark:bg-sage-950/40 dark:text-sage-400' :
                  task.status === 'inprogress' ? 'bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' :
                  'bg-cream-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'
                }`}>
                  {task.status === 'inprogress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'Backlog'}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-neutral-400">No tasks yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};


