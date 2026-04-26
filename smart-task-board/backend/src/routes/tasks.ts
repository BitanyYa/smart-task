import { Router, Response } from 'express';
import { z } from 'zod';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// Helper: recalculate project progress after a task status change
const recalcProjectProgress = async (projectId: string) => {
  const tasks = await Task.find({ project: projectId, deletedAt: null });
  if (tasks.length === 0) return;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
};

const taskSchema = z.object({
  title:             z.string().min(1),
  description:       z.string().optional(),
  status:            z.enum(['todo','inprogress','done']).optional(),
  priority:          z.enum(['low','medium','high']).optional(),
  labels:            z.array(z.string()).optional(),
  dueDate:           z.string().optional(),
  isRecurring:       z.boolean().optional(),
  recurringInterval: z.enum(['daily','weekly','monthly']).optional(),
  project:           z.string().nullable().optional(),
});

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({ owner: req.userId, deletedAt: null })
    .populate('comments.user', 'name avatar')
    .populate('activityLog.user', 'name')
    .populate('project', 'name')
    .sort({ createdAt: -1 });
  res.json(tasks);
});

// GET /api/tasks/trash
router.get('/trash', async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({ owner: req.userId, deletedAt: { $ne: null } })
    .sort({ deletedAt: -1 });
  res.json(tasks);
});

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

  const task = await Task.create({
    ...parsed.data,
    project: parsed.data.project || null,
    owner: req.userId,
    activityLog: [{ user: req.userId, action: 'Created this task' }],
  });

  // Recalc project progress if assigned
  if (task.project) await recalcProjectProgress(String(task.project));

  res.status(201).json(task);
});

// POST /api/tasks/:id/restore
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { deletedAt: null },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.project) await recalcProjectProgress(String(task.project));
  res.json(task);
});

// DELETE /api/tasks/:id/permanent
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (task?.project) await recalcProjectProgress(String(task.project));
  res.status(204).send();
});

// GET /api/tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId })
    .populate('comments.user', 'name avatar')
    .populate('activityLog.user', 'name')
    .populate('project', 'name');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, labels, dueDate, isRecurring, recurringInterval, project } = req.body;
  const logEntries: { user: string; action: string }[] = [];
  const oldProject = task.project ? String(task.project) : null;

  if (status && status !== task.status)     logEntries.push({ user: req.userId!, action: `Moved to ${status}` });
  if (priority && priority !== task.priority) logEntries.push({ user: req.userId!, action: `Changed priority to ${priority}` });
  if (title && title !== task.title)        logEntries.push({ user: req.userId!, action: 'Renamed task' });

  if (title !== undefined)             task.title = title;
  if (description !== undefined)       task.description = description;
  if (status !== undefined)            task.status = status;
  if (priority !== undefined)          task.priority = priority;
  if (labels !== undefined)            task.labels = labels;
  if (dueDate !== undefined)           task.dueDate = dueDate ? new Date(dueDate) : undefined;
  if (isRecurring !== undefined)       task.isRecurring = isRecurring;
  if (recurringInterval !== undefined) task.recurringInterval = recurringInterval;
  if (project !== undefined)           task.project = project || null;

  task.activityLog.push(...(logEntries as any));
  await task.save();

  // Recalc progress for old and new project
  const newProject = task.project ? String(task.project) : null;
  if (oldProject) await recalcProjectProgress(oldProject);
  if (newProject && newProject !== oldProject) await recalcProjectProgress(newProject);

  await task.populate('comments.user', 'name avatar');
  await task.populate('activityLog.user', 'name');
  await task.populate('project', 'name');
  res.json(task);
});

// DELETE /api/tasks/:id — soft delete
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.project) await recalcProjectProgress(String(task.project));
  res.json(task);
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $push: { comments: { user: req.userId, text: text.trim() } } },
    { new: true }
  ).populate('comments.user', 'name avatar');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.status(201).json(task.comments[task.comments.length - 1]);
});

// DELETE /api/tasks/:id/comments/:commentId
router.delete('/:id/comments/:commentId', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $pull: { comments: { _id: req.params.commentId } } },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.status(204).send();
});

// POST /api/tasks/:id/timer/start
router.post('/:id/timer/start', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.isTimerRunning) return res.status(400).json({ message: 'Timer already running' });
  task.timeEntries.push({ startedAt: new Date() });
  task.isTimerRunning = true;
  task.activityLog.push({ user: req.userId, action: 'Started timer' } as any);
  await task.save();
  res.json(task);
});

// POST /api/tasks/:id/timer/stop
router.post('/:id/timer/stop', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!task.isTimerRunning) return res.status(400).json({ message: 'Timer not running' });
  const last = task.timeEntries[task.timeEntries.length - 1];
  if (last) last.stoppedAt = new Date();
  task.isTimerRunning = false;
  task.activityLog.push({ user: req.userId, action: 'Stopped timer' } as any);
  await task.save();
  res.json(task);
});

export default router;
