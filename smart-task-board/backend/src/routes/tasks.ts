import { Router, Response } from 'express';
import { z } from 'zod';
import { Task } from '../models/Task';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

const taskSchema = z.object({
  title:              z.string().min(1),
  description:        z.string().optional(),
  status:             z.enum(['todo','inprogress','done']).optional(),
  priority:           z.enum(['low','medium','high']).optional(),
  labels:             z.array(z.string()).optional(),
  dueDate:            z.string().optional(),
  isRecurring:        z.boolean().optional(),
  recurringInterval:  z.enum(['daily','weekly','monthly']).optional(),
});

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  const tasks = await Task.find({ owner: req.userId, deletedAt: null })
    .populate('comments.user', 'name avatar')
    .populate('activityLog.user', 'name')
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
    owner: req.userId,
    activityLog: [{ user: req.userId, action: 'Created this task' }],
  });
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
  res.json(task);
});

// DELETE /api/tasks/:id/permanent
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  res.status(204).send();
});

// GET /api/tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId })
    .populate('comments.user', 'name avatar')
    .populate('activityLog.user', 'name');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, labels, dueDate, isRecurring, recurringInterval } = req.body;
  const logEntries: { user: string; action: string }[] = [];

  if (status && status !== task.status) {
    logEntries.push({ user: req.userId!, action: `Moved to ${status}` });
  }
  if (priority && priority !== task.priority) {
    logEntries.push({ user: req.userId!, action: `Changed priority to ${priority}` });
  }
  if (title && title !== task.title) {
    logEntries.push({ user: req.userId!, action: `Renamed task` });
  }

  if (title !== undefined)             task.title = title;
  if (description !== undefined)       task.description = description;
  if (status !== undefined)            task.status = status;
  if (priority !== undefined)          task.priority = priority;
  if (labels !== undefined)            task.labels = labels;
  if (dueDate !== undefined)           task.dueDate = dueDate ? new Date(dueDate) : undefined;
  if (isRecurring !== undefined)       task.isRecurring = isRecurring;
  if (recurringInterval !== undefined) task.recurringInterval = recurringInterval;

  task.activityLog.push(...(logEntries as any));
  await task.save();

  await task.populate('comments.user', 'name avatar');
  await task.populate('activityLog.user', 'name');
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
