import { Router, Response } from 'express';
import { Project } from '../models/Project';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }]
    }).populate('members', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status, dueDate } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      status: status || 'active',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      owner: req.userId!,
      members: [req.userId!],
    });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, $or: [{ owner: req.userId }, { members: req.userId }] },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/projects/:id/pin
router.patch('/:id/pin', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.pinned = !project.pinned;
    await project.save();
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
